<script setup lang="ts">
// Line icons for the Community page's "ways to get involved" cards: one drawing per way, in the stroke style the
// site uses elsewhere (round caps, 1.7 stroke), coloured by the text colour of the place they sit in. They are
// decoration: the card's title carries the meaning, so each is hidden from screen readers.
defineProps<{ name: 'calendar' | 'briefcase' | 'learn' | 'campus' | 'network' | 'mail' | 'committee' | 'story' }>()
</script>

<template>
  <svg aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    <template v-if="name === 'calendar'"><rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/></template>
    <template v-else-if="name === 'briefcase'"><rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 13h18"/></template>
    <template v-else-if="name === 'learn'"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H19v-5M8 7.5h7"/></template>
    <template v-else-if="name === 'campus'"><path d="M3 21h18M5 21V10l7-5 7 5v11M10 21v-5h4v5"/></template>
    <template v-else-if="name === 'network'"><circle cx="12" cy="6" r="2.5"/><circle cx="5.5" cy="17" r="2.5"/><circle cx="18.5" cy="17" r="2.5"/><path d="m10.8 8.2-4.1 6.6M13.2 8.2l4.1 6.6M8 17h8"/></template>
    <template v-else-if="name === 'mail'"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3 7.5 9 6 9-6"/></template>
    <template v-else-if="name === 'committee'"><circle cx="9" cy="8" r="3"/><path d="M3.5 20c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/><circle cx="17" cy="9" r="2.2"/><path d="M16 14.2c2.8 0 4.8 1.7 4.8 4.3"/></template>
    <template v-else-if="name === 'story'"><path d="M4 5h16v11H9.5L5 20.5V16H4V5Z"/><path d="M8 9.5h8M8 12.5h5"/></template>
  </svg>
</template>
