from mcp.server.fastmcp import FastMCP
from groq_client import generate_bug_report

mcp = FastMCP("bug-report-generator")


@mcp.tool()
def generate_bug_report_tool(description: str) -> dict:
    """
    Convert an informal bug description into a structured, developer-ready
    bug report. Intended for use by agents (monitoring bots, other AI
    systems) that detect or receive raw issue text and need a structured
    report back, without going through the human-facing web form.

    Args:
        description: Raw, informal description of the bug or issue.

    Returns:
        A structured bug report with title, severity, priority,
        environment, steps to reproduce, expected behavior, and
        actual behavior.
    """
    report = generate_bug_report(description)
    return report.model_dump()


if __name__ == "__main__":
    mcp.run(transport="stdio")