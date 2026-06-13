from app.core.database import engine, Base, SessionLocal
from app.models import Ocorrencia

# 1. Este comando olha para o models.py e CRIA a tabela no PostgreSQL!
print("Criando tabelas no banco de dados...")
Base.metadata.create_all(bind=engine)

# 2. Abrimos uma 'Sessão' (conexão) com o banco
db = SessionLocal()

# 3. Criamos um dado falso simulando o seu Web Scraping
nova_noticia = Ocorrencia(
    titulo_noticia="Furtos de cabos relatados na região central",
    latitude=-15.7942,
    longitude=-47.8821
)

# 4. Adicionamos e salvamos (commit) no banco
db.add(nova_noticia)
db.commit()
db.refresh(nova_noticia)

print(f"Sucesso! Notícia salva no banco com o ID: {nova_noticia.id}")

# Fechamos a conexão
db.close()