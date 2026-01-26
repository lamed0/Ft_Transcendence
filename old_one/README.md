# pingpong
ping pong game on a complete platform that's use the latest technologies

📢 Team Workflow & Rules
Welcome to the project! To keep our code clean and avoid conflicts, we are using a strict Feature Branch Workflow.

🛑 The Golden Rule: NEVER push code directly to the main branch. (Note: The system will automatically reject your push if you try.)

1. First Time Setup
Run this once to get the project:

Bash
```
git clone https://github.com/SegfaultSec/pingpong/
```
2. Your Daily Routine (The Cycle)
Every time you start a new task, follow these exact steps:

Step A: Update Local Code Always start fresh so you don't work on old code.

```
git checkout main
git pull origin main
```
Step B: Create Your Workspace Name your branch clearly (e.g., feature/login-page or fix/header-bug).
```
git checkout -b feature/my-task-name
```
Step C: Work & Save Write your code. When ready:
```
git add .
git commit -m "Description of what I added"
```
Step D: Publish Send your branch to GitHub.
```
git push origin feature/my-task-name
```
3. How to Merge (Pull Request)
Go to our GitHub Repo page.

You will see a yellow box saying "Compare & pull request". Click it.

Add a title and description.

Assign Reviewer: Select one of us to review your code.

Once approved, you (or the maintainer) can click Merge.

🆘 Troubleshooting
"Push Rejected"? You probably tried to push to main or someone updated the branch before you.

Need help? Create an Issue in the "Issues" tab or contact me on Discord.
