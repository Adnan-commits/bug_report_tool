from pydantic import BaseModel, Field
from typing import Literal, Optional

IssueType = Literal["bug", "feature_request", "question", "unclear"]


class BugReportRequest(BaseModel):
    description: str = Field(..., min_length=10, description="Raw informal issue description from user")


class GeneratedReport(BaseModel):
    type: IssueType
    reasoning: str  # one sentence: why this classification was chosen

    # Populated only when type == "bug"; None otherwise
    title: Optional[str] = None
    severity: Optional[Literal["Low", "Medium", "High", "Critical"]] = None
    priority: Optional[Literal["Low", "Medium", "High"]] = None
    environment: Optional[str] = None
    steps_to_reproduce: Optional[list[str]] = None
    expected_behavior: Optional[str] = None
    actual_behavior: Optional[str] = None


# Backward-compatible alias used by editor/export once type == "bug"
BugReport = GeneratedReport