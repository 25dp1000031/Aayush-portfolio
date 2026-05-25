<template>
  <section class="section certs-section" id="certs">
    <div class="container">
      <div class="section-header reveal">
        <span class="section-label">// credentials.verify()</span>
        <h2 class="section-title">Credentials &amp; Certifications</h2>
        <p class="section-sub">{{ CERTS.length }} verified credentials across cloud, DevOps, and AI platforms</p>
      </div>

      <div class="certs-grid">
        <a
          v-for="(cert, i) in CERTS"
          :key="cert.title"
          :href="cert.file"
          target="_blank"
          rel="noopener"
          class="cert-card reveal"
          :data-delay="i * 55"
        >
          <div class="cert-issuer">
            <i :class="[cert.issuerIcon, `icon-${cert.iconColor}`]"></i>
            <span>{{ cert.issuer }}</span>
          </div>
          <h4 class="cert-title">{{ cert.title }}</h4>
          <p class="cert-date">{{ cert.date }}</p>
          <span class="cert-view">View credential <i class="fas fa-external-link-alt"></i></span>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup>
const CERTS = [
  {
    issuer: 'Amazon Web Services',   issuerIcon: 'fab fa-aws',          iconColor: 'aws',
    title: 'AWS Academy Cloud Foundations',
    date: 'May 2025',
    file: './Certs/AWS_Academy_Graduate___AWS_Academy_Cloud_Foundations_Badge20250530-28-lgy4hl.pdf',
  },
  {
    issuer: 'Amazon Web Services',   issuerIcon: 'fab fa-aws',          iconColor: 'aws',
    title: 'AWS Academy Data Engineering',
    date: 'Sep 2025',
    file: './Certs/AWS_Academy_Graduate___AWS_Academy_Data_Engineering_Badge20250910-32-4ydgtk.pdf',
  },
  {
    issuer: 'Amazon Web Services',   issuerIcon: 'fab fa-aws',          iconColor: 'aws',
    title: 'Generative AI Foundations',
    date: 'Dec 2025',
    file: './Certs/aws-academy-graduate-aws-academy-data-engineering.png',
  },
  {
    issuer: 'Google Cloud',          issuerIcon: 'fab fa-google',       iconColor: 'google',
    title: 'Cloud Computing Foundations',
    date: 'Apr 2025',
    file: './Certs/google-cloud-computing-foundations-certificate.png',
  },
  {
    issuer: 'IIT Madras',            issuerIcon: 'fas fa-graduation-cap', iconColor: 'iitm',
    title: 'Introduction to Cloud using GCP',
    date: 'May 2025',
    file: './Certs/25dp1000031_Understanding_Google_Cloud_Platform.pdf',
  },
  {
    issuer: 'Udacity',               issuerIcon: 'fas fa-robot',         iconColor: 'udacity',
    title: 'Generative AI with AWS',
    date: 'May 2025',
    file: './Certs/Introducing Generative Ai wtih aws Udacity.pdf',
  },
  {
    issuer: 'IBM / Cognitive Class',  issuerIcon: 'fab fa-docker',       iconColor: 'docker',
    title: 'Docker Essentials',
    date: 'Mar 2025',
    file: './Certs/Docker Essentials A Developer Introduction.pdf',
  },
  {
    issuer: 'IBM / Cognitive Class',  issuerIcon: 'fas fa-cloud',        iconColor: 'ibm',
    title: 'Kubernetes & OpenShift V2',
    date: 'Mar 2025',
    file: './Certs/Introduction to Containers, Kubernetes, and OpenShift V2.pdf',
  },
  {
    issuer: 'IBM / Cognitive Class',  issuerIcon: 'fas fa-server',       iconColor: 'ibm',
    title: 'Cloud Native & Multicloud Apps',
    date: 'Mar 2025',
    file: './Certs/Building Cloud Native and Multicloud Applications.pdf',
  },
  {
    issuer: 'IBM / Cognitive Class',  issuerIcon: 'fas fa-server',       iconColor: 'ibm',
    title: 'IBM Cloud Essentials V3',
    date: 'Mar 2025',
    file: './Certs/IBM Cloud essentials.pdf',
  },
  {
    issuer: 'TrainWithShubham',      issuerIcon: 'fab fa-linux',         iconColor: 'tws',
    title: 'Linux For DevOps',
    date: 'May 2025',
    file: './Certs/Linux-TWS-certificate.png',
  },
  {
    issuer: 'TrainWithShubham',      issuerIcon: 'fab fa-git-alt',       iconColor: 'tws',
    title: 'Git & GitHub For DevOps',
    date: '2025',
    file: './Certs/GitGithub-TWS-certificate.png',
  },
  {
    issuer: 'TrainWithShubham',      issuerIcon: 'fab fa-aws',           iconColor: 'aws',
    title: 'AWS For DevOps',
    date: 'May 2025',
    file: './Certs/AWS-TWS-certificate.png',
  },
  {
    issuer: 'TrainWithShubham',      issuerIcon: 'fas fa-robot',         iconColor: 'tws',
    title: 'Generative AI For DevOps',
    date: 'May 2025',
    file: './Certs/GenAI-TWS-certificate.png',
  },
  {
    issuer: 'TrainWithShubham',      issuerIcon: 'fab fa-python',        iconColor: 'tws',
    title: 'Python For DevOps',
    date: 'Nov 2024',
    file: './Certs/PythonDevOps-TWS-certificate.png',
  },
]
</script>

<style scoped>
.certs-section { background: var(--bg-secondary); }
.section-header { margin-bottom: 52px; }

.certs-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
}

.cert-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 18px;
  transition: var(--transition);
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-decoration: none;
}
.cert-card:hover {
  transform: translateY(-4px);
  border-color: var(--border-glow);
  box-shadow: var(--shadow-glow);
}

.cert-issuer {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  color: var(--text-muted);
}

.cert-issuer i { font-size: 0.85rem; }
.icon-aws    { color: #FF9900; }
.icon-google { color: #4285F4; }
.icon-iitm   { color: var(--accent-purple); }
.icon-docker { color: #2496ED; }
.icon-ibm    { color: #1F70C1; }
.icon-udacity{ color: #02B3E4; }
.icon-tws    { color: var(--accent-green); }

.cert-title  { font-size: 0.82rem; font-weight: 600; line-height: 1.35; flex: 1; }
.cert-date   { font-family: var(--font-mono); font-size: 0.68rem; color: var(--text-muted); }
.cert-view   {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  color: var(--accent-green);
  transition: gap 0.2s;
}
.cert-card:hover .cert-view { gap: 8px; }

/* ─── Responsive ─── */
@media (max-width: 1100px) { .certs-grid { grid-template-columns: repeat(4,1fr); } }
@media (max-width: 860px)  { .certs-grid { grid-template-columns: repeat(3,1fr); } }
@media (max-width: 580px)  { .certs-grid { grid-template-columns: repeat(2,1fr); } }
@media (max-width: 380px)  { .certs-grid { grid-template-columns: 1fr; } }
</style>
