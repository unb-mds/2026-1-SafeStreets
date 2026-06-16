"""cria tabelas locais_pin ocorrencias_criminais e historico_consultas

Revision ID: 001_initial_schema
Revises:
Create Date: 2026-06-16

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── Tabela: locais_pin ───────────────────────────────────────────────────
    op.create_table(
        'locais_pin',
        sa.Column('id',                    sa.Integer(),      nullable=False),
        sa.Column('latitude',              sa.Numeric(9, 6),  nullable=False),
        sa.Column('longitude',             sa.Numeric(9, 6),  nullable=False),
        sa.Column('regiao_administrativa', sa.String(10),     nullable=False),
        sa.Column('nome_regiao',           sa.String(100),    nullable=True),
        sa.Column('tipo_localizacao',      sa.String(20),     nullable=True),
        sa.Column('criado_em',             sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.CheckConstraint('latitude BETWEEN -90 AND 90',    name='chk_latitude'),
        sa.CheckConstraint('longitude BETWEEN -180 AND 180', name='chk_longitude'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('idx_locais_pin_coords', 'locais_pin', ['latitude', 'longitude'],  unique=False)
    op.create_index('idx_locais_pin_regiao', 'locais_pin', ['regiao_administrativa'],   unique=False)

    # ── Tabela: ocorrencias_criminais ────────────────────────────────────────
    op.create_table(
        'ocorrencias_criminais',
        sa.Column('id',                    sa.Integer(),       nullable=False),
        sa.Column('locais_pin_id',         sa.Integer(),       nullable=False),
        sa.Column('titulo_noticia',        sa.String(500),     nullable=False),
        sa.Column('descricao_detalhada',   sa.Text(),          nullable=True),
        sa.Column('fonte_url',             sa.String(2048),    nullable=True),
        sa.Column('latitude',              sa.Numeric(9, 6),   nullable=False),
        sa.Column('longitude',             sa.Numeric(9, 6),   nullable=False),
        sa.Column('regiao_administrativa', sa.String(10),      nullable=False),
        sa.Column('resumo_gemini',         sa.Text(),          nullable=True),
        sa.Column('resumo_status',         sa.String(20),      nullable=True),
        sa.Column('risco_nivel',           sa.String(10),      nullable=True),
        sa.Column('data_ocorrencia',       sa.DateTime(timezone=True), nullable=False),
        sa.Column('criado_em',             sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('atualizado_em',         sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.CheckConstraint(
            "resumo_status IN ('COMPLETO', 'PENDENTE', 'ERRO', 'FALLBACK_GENERICO')",
            name='chk_resumo_status'
        ),
        sa.CheckConstraint(
            "risco_nivel IN ('baixo', 'medio', 'alto')",
            name='chk_risco_nivel'
        ),
        sa.ForeignKeyConstraint(['locais_pin_id'], ['locais_pin.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('idx_ocorrencias_pin',    'ocorrencias_criminais', ['locais_pin_id'],          unique=False)
    op.create_index('idx_ocorrencias_regiao', 'ocorrencias_criminais', ['regiao_administrativa'],  unique=False)
    op.create_index('idx_ocorrencias_data',   'ocorrencias_criminais', ['data_ocorrencia'],        unique=False)
    # Índice parcial: só ocorrências pendentes de resumo
    op.execute(
        "CREATE INDEX idx_ocorrencias_status ON ocorrencias_criminais (resumo_status) "
        "WHERE resumo_status = 'PENDENTE'"
    )

    # ── Tabela: historico_consultas ──────────────────────────────────────────
    op.create_table(
        'historico_consultas',
        sa.Column('id',                           sa.Integer(),    nullable=False),
        sa.Column('locais_pin_id',                sa.Integer(),    nullable=True),
        sa.Column('timestamp_ultima_atualizacao', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('ttl_expiracao',                sa.DateTime(timezone=True), nullable=False),
        sa.Column('raio_geografico',              sa.String(100),  nullable=True),
        sa.Column('total_ocorrencias_cached',     sa.Integer(),    nullable=True),
        sa.Column('criado_em',                    sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['locais_pin_id'], ['locais_pin.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('idx_historico_ttl', 'historico_consultas', ['ttl_expiracao'],  unique=False)
    op.create_index('idx_historico_pin', 'historico_consultas', ['locais_pin_id'],  unique=False)


def downgrade() -> None:
    op.drop_index('idx_historico_pin',    table_name='historico_consultas')
    op.drop_index('idx_historico_ttl',    table_name='historico_consultas')
    op.drop_table('historico_consultas')

    op.execute('DROP INDEX IF EXISTS idx_ocorrencias_status')
    op.drop_index('idx_ocorrencias_data',   table_name='ocorrencias_criminais')
    op.drop_index('idx_ocorrencias_regiao', table_name='ocorrencias_criminais')
    op.drop_index('idx_ocorrencias_pin',    table_name='ocorrencias_criminais')
    op.drop_table('ocorrencias_criminais')

    op.drop_index('idx_locais_pin_regiao', table_name='locais_pin')
    op.drop_index('idx_locais_pin_coords', table_name='locais_pin')
    op.drop_table('locais_pin')
