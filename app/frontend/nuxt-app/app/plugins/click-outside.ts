export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('click-outside', {
    mounted(el: HTMLElement, binding: any) {
      // Создаем обработчик
      const handler = (event: MouseEvent) => {
        // Проверяем, что клик был вне элемента
        if (!(el === event.target || el.contains(event.target as Node))) {
          // Вызываем переданную функцию
          binding.value(event);
        }
      };
      
      // Сохраняем обработчик в элемент
      (el as any)._clickOutsideHandler = handler;
      
      // Добавляем обработчик с небольшой задержкой
      setTimeout(() => {
        document.addEventListener('click', handler);
      }, 0);
    },
    
    beforeUnmount(el: HTMLElement) {
      // Удаляем обработчик при размонтировании
      const handler = (el as any)._clickOutsideHandler;
      if (handler) {
        document.removeEventListener('click', handler);
      }
    }
  });
  
  console.log('✅ Click Outside directive registered');
});