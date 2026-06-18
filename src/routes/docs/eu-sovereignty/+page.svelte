<script lang="ts">
  import Article from '$lib/components/Article.svelte'
</script>

<Article
  title="Why gittan runs in the EU"
  subtitle="Your source code is your business. It should stay in your jurisdiction."
>
  <p>
    gittan runs on EU infrastructure. Your source code, pipeline logs, metadata, and
    credentials never leave the European Union. This is not a compliance checkbox — it
    is a deliberate architectural decision about where your most sensitive asset lives.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Source code is your crown jewels</h2>

  <p>
    Your source code is the most complete description of your business logic, your
    competitive advantage, and your technical decisions that exists. It contains API
    keys, infrastructure patterns, algorithmic choices, and domain knowledge that took
    years to accumulate. It is more sensitive than your customer database because it
    describes how everything works.
  </p>

  <p>
    Most organizations store this asset on US-hosted platforms without a second thought.
    GitHub is owned by Microsoft. GitLab's SaaS runs on Google Cloud in the US. Bitbucket
    is Atlassian, headquartered in Australia with US infrastructure. Your European
    company's most sensitive intellectual property lives under US jurisdiction.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Jurisdiction matters</h2>

  <p>
    The US CLOUD Act allows US law enforcement to compel US-based companies to hand over
    data stored anywhere in the world, regardless of where the data is physically hosted.
    If your source code is on GitHub — even if GitHub stores it in an EU data center —
    Microsoft can be compelled to produce it under a US warrant without notifying you.
  </p>

  <p>
    GDPR and the Schrems II ruling established that EU personal data transfers to the US
    are problematic because US surveillance law does not provide equivalent protections.
    Source code may contain personal data — developer names in commit messages, user
    identifiers in test fixtures, email addresses in configuration files. The legal
    exposure is real even if the primary content is code.
  </p>

  <p>
    This is not paranoia. It is risk assessment. If you would not store your customer
    database on a US platform without a data processing agreement and transfer impact
    assessment, you should ask why you store your source code there without the same
    scrutiny.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">EU infrastructure, EU company</h2>

  <p>
    gittan is operated by Bloomer AB, a Swedish company. We are subject to Swedish and
    EU law. We are not subject to the US CLOUD Act. A US warrant cannot compel us to
    produce your data because we are not a US entity and your data is not on US
    infrastructure.
  </p>

  <p>
    Our infrastructure runs in EU data centers. Compute, storage, networking — all of it.
    There is no "EU region" option on a US cloud platform. The infrastructure is EU from
    the ground up. Your data does not cross the Atlantic for processing, for backups, or
    for disaster recovery.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Digital sovereignty is not optional</h2>

  <p>
    The European conversation about digital sovereignty has been abstract for too long —
    policy papers, framework regulations, and compliance checklists. Meanwhile, European
    companies store their most valuable intellectual property on US platforms and hope
    the legal frameworks hold.
  </p>

  <p>
    We think this will change. Not because of regulation, but because organizations will
    start treating source code with the same seriousness they treat financial data. When
    that happens, "where does my code live and who can access it" becomes a procurement
    question, not an afterthought.
  </p>

  <p>
    gittan is ready for that question. Your code lives in the EU. It is operated by an
    EU company. It is subject to EU law. The answer is simple because we designed it to
    be.
  </p>

  <h2 class="text-lg font-semibold text-surface-300 pt-2">Not just compliance</h2>

  <p>
    We did not choose EU infrastructure to tick a compliance box. We chose it because
    we believe that European software companies should not depend on US infrastructure
    for their core development tools. Not because the US is adversarial, but because
    dependency on another jurisdiction's legal framework is a risk that grows over time.
  </p>

  <p>
    Trade policies change. Sanctions regimes change. Legal interpretations change. A
    tool that works today under current agreements might become problematic tomorrow
    under different ones. Keeping your source code in your own jurisdiction eliminates
    that variable entirely.
  </p>

  <p>
    This is what sovereignty means in practice: not a flag on a dashboard, but a
    deliberate choice about where your critical assets live and who has legal authority
    over them.
  </p>
</Article>
