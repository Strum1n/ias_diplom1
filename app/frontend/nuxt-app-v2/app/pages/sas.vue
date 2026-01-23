<template>
  <div class="chart-grid">
    <VChart :option="option" style="height: 450px; width: 100%" />
  </div>
</template>

<script setup lang="ts">
const option = {
  legend: {
    bottom: 0,
  },
  series: [
    {
      name: "2012",
      type: "pie",
      radius: "20%",
      center: ["25%", "30%"],
      data: [
        { value: 86.5, name: "Milk Tea" },
        { value: 41.1, name: "Matcha Latte" },
        { value: 24.1, name: "Cheese Cocoa" },
        { value: 55.2, name: "Walnut Brownie" },
      ],
    },
    {
      name: "2013",
      type: "pie",
      radius: "20%",
      center: ["75%", "30%"],
      data: [
        { value: 92.1, name: "Milk Tea" },
        { value: 30.4, name: "Matcha Latte" },
        { value: 67.2, name: "Cheese Cocoa" },
        { value: 67.1, name: "Walnut Brownie" },
      ],
    },
    {
      name: "2014",
      type: "pie",
      radius: "20%",
      center: ["25%", "75%"],
      data: [
        { value: 85.7, name: "Milk Tea" },
        { value: 65.1, name: "Matcha Latte" },
        { value: 79.5, name: "Cheese Cocoa" },
        { value: 69.2, name: "Walnut Brownie" },
      ],
    },
    {
      name: "2015",
      type: "pie",
      radius: "20%",
      center: ["75%", "75%"],
      data: [
        { value: 83.1, name: "Milk Tea" },
        { value: 53.3, name: "Matcha Latte" },
        { value: 86.4, name: "Cheese Cocoa" },
        { value: 72.4, name: "Walnut Brownie" },
      ],
    },
  ],
};
</script>

<style scoped>
.chart-grid {
  height: 450px;
}
</style>
