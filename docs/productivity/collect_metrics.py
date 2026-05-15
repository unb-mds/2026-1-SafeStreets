import os
import json
from datetime import datetime
from github import Github
import re

def main():
    token = os.getenv("GITHUB_TOKEN")
    repo_name = os.getenv("GITHUB_REPOSITORY", "unb-mds/2026-1-SafeStreets")
    
    gh = Github(token)
    repo = gh.get_repo(repo_name)
    
    dados = {
        "generated_at": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "repository": repo_name,
        "issues_per_week": {},
        "commit_message_histogram": {"0-20": 0, "21-50": 0, "51-100": 0, "101-200": 0, "200+": 0},
        "coauthors_per_week": {},
        "commit_heatmap": {},
        "top_committers": {},
        "top_pr_authors": {},
        "top_issue_contributors": {}
    }

    commits = repo.get_commits()
    for c in commits[:200]:
        if not c.commit or not c.commit.author: continue
        date = c.commit.author.date
        week = f"{date.year}-W{date.isocalendar()[1]:02d}"
        
        msg_len = len(c.commit.message)
        if msg_len <= 20: dados["commit_message_histogram"]["0-20"] += 1
        elif msg_len <= 50: dados["commit_message_histogram"]["21-50"] += 1
        elif msg_len <= 100: dados["commit_message_histogram"]["51-100"] += 1
        elif msg_len <= 200: dados["commit_message_histogram"]["101-200"] += 1
        else: dados["commit_message_histogram"]["200+"] += 1
            
        co_authors = len(re.findall(r'Co-authored-by:', c.commit.message, re.IGNORECASE))
        dados["coauthors_per_week"][week] = dados["coauthors_per_week"].get(week, 0) + co_authors
        
        day, hour = date.weekday(), date.hour
        key_heat = f"{day}-{hour}"
        dados["commit_heatmap"][key_heat] = dados["commit_heatmap"].get(key_heat, 0) + 1
        
        author = c.author.login if c.author else c.commit.author.name
        dados["top_committers"][author] = dados["top_committers"].get(author, 0) + 1

    issues = repo.get_issues(state="all")
    for i in issues[:200]:
        week = f"{i.created_at.year}-W{i.created_at.isocalendar()[1]:02d}"
        user = i.user.login if i.user else "ghost"
        if week not in dados["issues_per_week"]: dados["issues_per_week"][week] = {"opened": 0, "closed": 0}
        if i.state == "closed": dados["issues_per_week"][week]["closed"] += 1
        else: dados["issues_per_week"][week]["opened"] += 1
        if i.pull_request: dados["top_pr_authors"][user] = dados["top_pr_authors"].get(user, 0) + 1
        else:
            if user not in dados["top_issue_contributors"]: dados["top_issue_contributors"][user] = {"opened": 0, "closed": 0, "total": 0}
            if i.state == "closed": dados["top_issue_contributors"][user]["closed"] += 1
            else: dados["top_issue_contributors"][user]["opened"] += 1
            dados["top_issue_contributors"][user]["total"] += 1

    # Formatação final para a Spec
    dados["issues_per_week"] = [{"week": k, "opened": v["opened"], "closed": v["closed"]} for k, v in dados["issues_per_week"].items()]
    dados["commit_message_histogram"] = [{"range": k, "count": v} for k, v in dados["commit_message_histogram"].items()]
    dados["coauthors_per_week"] = [{"week": k, "count": v} for k, v in dados["coauthors_per_week"].items()]
    dados["commit_heatmap"] = [{"day": int(k.split('-')[0]), "hour": int(k.split('-')[1]), "count": v} for k, v in dados["commit_heatmap"].items()]
    dados["top_committers"] = [{"username": k, "name": k, "commits": v} for k, v in sorted(dados["top_committers"].items(), key=lambda x: x[1], reverse=True)[:10]]
    dados["top_pr_authors"] = [{"username": k, "name": k, "prs_opened": v} for k, v in sorted(dados["top_pr_authors"].items(), key=lambda x: x[1], reverse=True)[:10]]
    dados["top_issue_contributors"] = [{"username": k, "name": k, **v} for k, v in sorted(dados["top_issue_contributors"].items(), key=lambda x: x[1]["total"], reverse=True)[:10]]

    dir_path = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(dir_path, "metrics.json"), "w") as f:
        json.dump(dados, f, indent=2)

if __name__ == "__main__":
    main()