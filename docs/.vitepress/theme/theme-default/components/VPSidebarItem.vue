<script setup lang="ts">
  import type { DefaultTheme } from "vitepress/theme";
  import { computed } from "vue";
  import { useSidebarControl } from "../composables/sidebar";

  import VPLink from "./VPLink.vue";

  const props = defineProps<{
    item: DefaultTheme.SidebarItem;
    depth: number;
  }>();

  const { collapsed, collapsible, isLink, isActiveLink, hasActiveLink, hasChildren, toggle } =
    useSidebarControl(computed(() => props.item));

  const sectionTag = computed(() => (hasChildren.value ? "section" : `div`));

  const linkTag = computed(() => (isLink.value ? "a" : "div"));

  const textTag = computed(() => {
    return !hasChildren.value ? "p" : props.depth + 2 === 7 ? "p" : `h${props.depth + 2}`;
  });

  const itemRole = computed(() => (isLink.value ? undefined : "button"));

  const classes = computed(() => [
    [`level-${props.depth}`],
    { collapsible: collapsible.value },
    { collapsed: collapsed.value },
    { "is-link": isLink.value },
    { "is-active": isActiveLink.value },
    { "has-active": hasActiveLink.value },
  ]);

  function onItemInteraction(e: MouseEvent | Event) {
    if ("key" in e && e.key !== "Enter") {
      return;
    }
    !props.item.link && toggle();
  }

  function onCaretClick() {
    props.item.link && toggle();
  }

  const selectedVersion = computed(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("selectedVersion") || "{}");
    } else {
      return {};
    }
  });

  function onVersionChange(e) {
    const version = e.target.value;
    const moduleName = props.item.module;
    const selected = selectedVersion.value;
    selected[moduleName] = version;
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedVersion", JSON.stringify(selected));
      window.location.reload(); // 페이지를 새로고침하여 변경된 버전 반영
    }
  }
</script>

<template>
  <component :is="sectionTag" class="VPSidebarItem" :class="classes">
    <div
      v-if="item.text"
      class="item"
      :role="itemRole"
      v-on="item.items ? { click: onItemInteraction, keydown: onItemInteraction } : {}"
      :tabindex="item.items && 0"
    >
      <div class="indicator" />

      <VPLink
        v-if="item.link"
        :method="item.method"
        :todo="item.todo"
        :tag="linkTag"
        class="link"
        :href="item.link"
        :rel="item.rel"
        :target="item.target"
      >
        <component
          v-if="selectedVersion?.[item.module] === item.version"
          :is="textTag"
          class="text"
        >
          <div class="label-zone">
            <div>
              <span v-if="item?.todo" class="label todo">TODO</span>
              <span v-if="item?.method?.includes('GET')" class="label get">GET</span>
              <span v-if="item?.method?.includes('POST')" class="label post">POST</span>
              <span v-if="item?.method?.includes('PUT')" class="label put">PUT</span>
              <span v-if="item?.method?.includes('DELETE')" class="label delete">DELETE</span>
            </div>
          </div>
          <div :style="{ 'font-size': item.text.length > 20 ? '12px' : '14px' }">{{
            item.text
          }}</div>
        </component>
      </VPLink>
      <component v-else :is="textTag" class="text">
        {{ item.text }}
        <select v-if="item?.versionList" @change="onVersionChange">
          <option value="">Select version</option>
          <option
            v-for="version in item.versionList"
            :key="version"
            :value="version"
            :selected="selectedVersion?.[item.module] === version"
          >
            {{ version }}
          </option>
        </select>
      </component>

      <div
        v-if="item.collapsed != null && item.items && item.items.length"
        class="caret"
        role="button"
        aria-label="toggle section"
        @click="onCaretClick"
        @keydown.enter="onCaretClick"
        tabindex="0"
      >
        <span class="vpi-chevron-right caret-icon" />
      </div>
    </div>

    <div v-if="item.items && item.items.length" class="items">
      <template v-if="depth < 5">
        <VPSidebarItem v-for="i in item.items" :key="i.text" :item="i" :depth="depth + 1" />
      </template>
    </div>
  </component>
</template>

<style scoped>
  .VPSidebarItem.level-0 {
    padding-bottom: 24px;
  }

  .VPSidebarItem.collapsed.level-0 {
    padding-bottom: 10px;
  }

  .item {
    position: relative;
    display: flex;
    width: 100%;
  }

  .VPSidebarItem.collapsible > .item {
    cursor: pointer;
  }

  .indicator {
    position: absolute;
    top: 6px;
    bottom: 6px;
    left: -17px;
    width: 2px;
    border-radius: 2px;
    transition: background-color 0.25s;
  }

  .VPSidebarItem.level-2.is-active > .item > .indicator,
  .VPSidebarItem.level-3.is-active > .item > .indicator,
  .VPSidebarItem.level-4.is-active > .item > .indicator,
  .VPSidebarItem.level-5.is-active > .item > .indicator {
    background-color: var(--vp-c-brand-1);
  }

  .link {
    display: flex;
    align-items: center;
    flex-grow: 1;
  }

  .text {
    flex-grow: 1;
    padding: 4px 0;
    line-height: 24px;
    font-size: 14px;
    transition: color 0.25s;
  }

  .VPSidebarItem.level-0 .text {
    font-weight: 700;
    color: var(--vp-c-text-1);
  }

  .VPSidebarItem.level-1 .text,
  .VPSidebarItem.level-2 .text,
  .VPSidebarItem.level-3 .text,
  .VPSidebarItem.level-4 .text,
  .VPSidebarItem.level-5 .text {
    font-weight: 500;
    color: var(--vp-c-text-2);
  }

  .VPSidebarItem.level-0.is-link > .item > .link:hover .text,
  .VPSidebarItem.level-1.is-link > .item > .link:hover .text,
  .VPSidebarItem.level-2.is-link > .item > .link:hover .text,
  .VPSidebarItem.level-3.is-link > .item > .link:hover .text,
  .VPSidebarItem.level-4.is-link > .item > .link:hover .text,
  .VPSidebarItem.level-5.is-link > .item > .link:hover .text {
    color: var(--vp-c-brand-1);
  }

  .VPSidebarItem.level-0.has-active > .item > .text,
  .VPSidebarItem.level-1.has-active > .item > .text,
  .VPSidebarItem.level-2.has-active > .item > .text,
  .VPSidebarItem.level-3.has-active > .item > .text,
  .VPSidebarItem.level-4.has-active > .item > .text,
  .VPSidebarItem.level-5.has-active > .item > .text,
  .VPSidebarItem.level-0.has-active > .item > .link > .text,
  .VPSidebarItem.level-1.has-active > .item > .link > .text,
  .VPSidebarItem.level-2.has-active > .item > .link > .text,
  .VPSidebarItem.level-3.has-active > .item > .link > .text,
  .VPSidebarItem.level-4.has-active > .item > .link > .text,
  .VPSidebarItem.level-5.has-active > .item > .link > .text {
    color: var(--vp-c-text-1);
  }

  .VPSidebarItem.level-0.is-active > .item .link > .text,
  .VPSidebarItem.level-1.is-active > .item .link > .text,
  .VPSidebarItem.level-2.is-active > .item .link > .text,
  .VPSidebarItem.level-3.is-active > .item .link > .text,
  .VPSidebarItem.level-4.is-active > .item .link > .text,
  .VPSidebarItem.level-5.is-active > .item .link > .text {
    color: var(--vp-c-brand-1);
  }

  .caret {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: -7px;
    width: 32px;
    height: 32px;
    color: var(--vp-c-text-3);
    cursor: pointer;
    transition: color 0.25s;
    flex-shrink: 0;
  }

  .item:hover .caret {
    color: var(--vp-c-text-2);
  }

  .item:hover .caret:hover {
    color: var(--vp-c-text-1);
  }

  .caret-icon {
    font-size: 18px;
    transform: rotate(90deg);
    transition: transform 0.25s;
  }

  .VPSidebarItem.collapsed .caret-icon {
    transform: rotate(0);
  }

  .VPSidebarItem.level-1 .items,
  .VPSidebarItem.level-2 .items,
  .VPSidebarItem.level-3 .items,
  .VPSidebarItem.level-4 .items,
  .VPSidebarItem.level-5 .items {
    border-left: 1px solid var(--vp-c-divider);
    padding-left: 16px;
  }

  .VPSidebarItem.collapsed .items {
    display: none;
  }
  .label-zone {
    line-height: 10px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  .label.get {
    background-color: var(--vp-c-indigo-3);
    color: var(--vp-c-gray-3);
    padding: 2px 4px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 10px;
    margin-right: 1px;
  }

  .label.post {
    background-color: var(--vp-c-green-3);
    color: var(--vp-c-gray-3);
    padding: 2px 4px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 10px;
    margin-right: 1px;
  }

  .label.put {
    background-color: var(--vp-c-yellow-3);
    color: var(--vp-c-gray-3);
    padding: 2px 4px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 10px;
    margin-right: 1px;
  }

  .label.delete {
    background-color: var(--vp-c-red-3);
    color: var(--vp-c-gray-3);
    padding: 2px 4px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 10px;
    margin-right: 1px;
  }

  .label.todo {
    background-color: var(--vp-c-purple-3);
    color: var(--vp-c-gray-3);
    padding: 2px 3px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 10px;
    margin-right: 4px;
  }
</style>
