import os
import json
from datetime import datetime
from collections import Counter
from github import Github

def get_week_string(date_obj):
    year, week, _ = date_obj.isocalendar()
    return f"{year}-W{week:02d}"

def main():
    token = os.environ.get("GITHUB_TOKEN")
    g = Github(token)
    repo_name = "unb-mds/2026-1-SafeStreets"
    repo = g.get_repo(repo_name)

    data = {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "repository": repo_name,
        "issues_per_week": [],
        "commit_message_histogram": [],
        "commit_heatmap": [],
        "top_committers": [],
        "top_pr_authors": [],
        "top_issue_contributors": [],
        "label_distribution": []
    }

    print("🛰️ Coletando Issues e PRs...")
    issues_weeks = {}
    label_counter = Counter()
    pr_authors = Counter()
    issue_authors = Counter()

    recent_items = repo.get_issues(state="all", sort="created", direction="desc")[:300]
    
    for item in recent_items:
        labels = item.get_labels()
        for l in labels:
            label_counter[l.name] += 1
            
        if item.pull_request:
            pr_authors[item.user.login] += 1
        else:
            issue_authors[item.user.login] += 1

        week = get_week_string(item.created_at)
        if week not in issues_weeks: issues_weeks[week] = {"opened": 0, "closed": 0}
        issues_weeks[week]["opened"] += 1

        if item.closed_at:
            c_week = get_week_string(item.closed_at)
            if c_week not in issues_weeks: issues_weeks[c_week] = {"opened": 0, "closed": 0}
            issues_weeks[c_week]["closed"] += 1

    for week, counts in issues_weeks.items():
        data["issues_per_week"].append({"week": week, "opened": counts["opened"], "closed": counts["closed"]})

    for label, count in label_counter.most_common(15):
        data["label_distribution"].append({"label": label, "count": count})

    print("🛰️ Coletando Commits...")
    commit_authors = Counter()
    hist_bins = {"0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81+": 0}
    heatmap_counter = Counter()

    for commit in repo.get_commits()[:300]:
        if commit.author: commit_authors[commit.author.login] += 1
        
        msg_len = len(commit.commit.message)
        if msg_len <= 20: hist_bins["0-20"] += 1
        elif msg_len <= 40: hist_bins["21-40"] += 1
        elif msg_len <= 60: hist_bins["41-60"] += 1
        elif msg_len <= 80: hist_bins["61-80"] += 1
        else: hist_bins["81+"] += 1

        dt = commit.commit.author.date
        heatmap_counter[(dt.isoweekday() % 7, dt.hour)] += 1

    for r, c in hist_bins.items(): data["commit_message_histogram"].append({"range": r, "count": c})
    for (d, h), c in heatmap_counter.items(): data["commit_heatmap"].append({"day": d, "hour": h, "count": c})

    # AQUI ESTÁ A MÁGICA: Mudei para pegar até 6 pessoas nos rankings
    for user, count in commit_authors.most_common(6): data["top_committers"].append({"username": user, "commits": count})
    for user, count in pr_authors.most_common(6): data["top_pr_authors"].append({"username": user, "prs_opened": count})
    for user, count in issue_authors.most_common(6): data["top_issue_contributors"].append({"username": user, "total": count})

    os.makedirs("docs/productivity", exist_ok=True)
    with open("docs/productivity/metrics.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("🚀 Sucesso!")

if __name__ == "__main__":
    main()