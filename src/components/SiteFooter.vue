<template>
  <footer class="footer-info">
    <div class="footer-info__inner">
      <p>
        @2025 teetee. 
        <a 
          href="https://beian.miit.gov.cn" 
          target="_blank" 
          rel="noopener noreferrer"
          class="beian-link"
        >
          陕ICP备2025077051号
        </a>
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts"></script>

<script lang="ts">
export default { name: 'SiteFooter' }
</script>

<style scoped>
.footer-info {
  background: var(--color-bg);
  border-top: 1px solid var(--color-border);
  margin-top: 2rem; /* 与上方内容保持间距 */
  width: 100%; /* 占满父容器宽度，让border延伸到边缘 */
}
.footer-info__inner {
  width: 100%; /* 占满父容器宽度 */
  margin-inline: 0; /* 移除居中margin */
  padding-block: clamp(1rem, 2.5vh, 2rem);
  padding-inline: 3rem; /* 为内容添加左右内边距，与上方内容保持一致 */
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
  display: grid;
  gap: .6rem;
}
.copy { color: var(--color-text); font-weight: 500; }

.beian-link {
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.2s ease;
}

.beian-link:hover {
  color: var(--color-text);
  text-decoration: underline;
}

@media (max-aspect-ratio: 1/1){
  .footer-info{
    display: none;
  }
}
</style>

