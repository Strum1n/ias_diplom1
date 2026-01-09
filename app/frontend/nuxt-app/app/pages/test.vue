<template>
    <div>
        <h1>Offers</h1>
        <div v-if="offers === null">Загрузка...</div>
        <ul v-else>
            <li v-for="offer in offers.offers" :key="offer.id">
                {{ offer.title }}
            </li>
        </ul>
    </div>
</template>
<script setup>
const { $api } = useNuxtApp()
const { data: offers } = await useAsyncData('offers', () => $api('/offers'))
console.log(offers.value)
</script>