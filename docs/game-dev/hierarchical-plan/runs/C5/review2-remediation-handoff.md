# C5 review 2 remediation — 2026-11-18

Worktree HEAD `793447a27851ec914bb4258072c6730ad8e291db`, with the delivered C4 inputs and C5 changes in the working tree. This delta changes only the C5 test fixture and this handoff; product code, generated artifacts, C4 inputs and historical reports were not changed.

- Finding .6: the mask 1/2 mapping swap now expects `missing underlay coverage`; the existing separate atlas RGB mutation still checks that atlas bytes affect the output.
- Finding .7: the successful port overlay shift moves garden's first port from x=19 to x=18; a separate x=20 case expects `invalid port macro coordinate`. Renderer bounds remain unchanged.

The test file SHA-256 after editing is `17408ad6518d7bd110ff7f189b4385af681c2ad676240305b6a8dba4e0a7fa6c`. Index SHA-256 remains `e1d936bcb62779289dbdb5e2d9bd246fd8a77114e7811f888f77f01fb55ca10d`, identical to review 2. Review 2 recorded all 22 indexed input/artifact hashes matching that snapshot; this delta did not independently recheck those 22 files. `git diff --check` exited 0, with Git line-ending warnings for `.gitattributes` and the pipeline README.

The assertions are based on review 2's static analysis and have not been executed. The proposed three-file test command remains unapproved; no suite, generator, verify or equivalent execution was run in this delta. AC1 reproducibility and negative fixtures therefore remain pending, as do checkout/land verification, runtime, production and actor clearance. AC2/3 evidence remains in `review1-remediation-handoff.md`, `source-ac-coverage.md`, the guide supplement and pipeline README; their earlier evidence does not establish a test PASS for this snapshot. Review 3 must evaluate the present test and handoff snapshot.

Knowledge: applied [k:01M7DE8V43RRQF5CG91ESM8A48] for snapshot provenance and historical reports, and [k:01M7FG738VNZM1G78VR1V56569] for port versus arrival. No new candidate: these fixture-specific mistakes do not establish a reusable project rule, and the port distinction already has an entry.
