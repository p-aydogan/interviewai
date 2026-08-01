# Engineering Sprint Records

This folder stores the permanent technical history of Talentry implementation sprints. Reports make each sprint reviewable, preserve the reasoning behind the resulting code, and provide evidence of scope and validation.

## Naming convention

Each implementation sprint creates two files:

```text
Sprint_<SPRINT_ID>_Summary.md
Sprint_<SPRINT_ID>_Engineering_Report.md
```

Use the sprint identifier exactly as approved for the task. Keep each sprint's two files together in this folder.

## Summary and Engineering Report

The Summary is the concise acceptance record. It identifies the sprint, branch, goal, status, changed files, validation results, known risks, and approval state.

The Engineering Report is the detailed technical record. It documents boundaries, repository state, implementation decisions, file responsibilities, public interfaces, accessibility, token usage, exact validation results, Git status, complete sprint-file diffs, risks, untouched modules, and the approval requirement.

## Immutability

Sprint reports are immutable historical records after creation and review. Do not rewrite an earlier report to describe later work. Corrections or follow-up work must be documented by a new sprint report or an explicitly approved addendum.

## Finding sprint history

Search this directory by sprint ID. Start with `Sprint_<SPRINT_ID>_Summary.md` for the outcome, then open `Sprint_<SPRINT_ID>_Engineering_Report.md` for the complete technical history and diffs.

This governance setup does not retroactively create reports for earlier sprints.
