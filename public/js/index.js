document.addEventListener('DOMContentLoaded', () => {
  // 元素获取
  const makeBtn = document.querySelector('.make');
  const makeSpan = makeBtn.querySelector('.makeSpan');
  const makeDD = document.querySelector('.makeDropDown');
  const typeBtn = document.querySelector('.bodyType');
  const typeSpan = typeBtn.querySelector('.bodyTypeSpan');
  const typeDD = document.querySelector('.bodyTypeDropDown');

  // 通用方法：切换与隐藏
  function toggle(dd, arrow) {
    dd.classList.toggle('hidden');
    arrow.classList.toggle('rotate-180');
  }
  function hide(dd, arrow) {
    dd.classList.add('hidden');
    arrow.classList.remove('rotate-180');
  }

  // 阻止下拉内部点击冒泡
  [makeDD, typeDD].forEach(dd => dd.addEventListener('click', e => e.stopPropagation()));

  // 点击空白收起所有下拉
  document.addEventListener('click', () => {
    hide(makeDD, makeSpan);
    hide(typeDD, typeSpan);
    searchDropDown.classList.add('hidden');
  });

  // Button 区域点击：始终切换下拉
  makeBtn.addEventListener('click', e => {
    e.stopPropagation();
    toggle(makeDD, makeSpan);
  });
  typeBtn.addEventListener('click', e => {
    e.stopPropagation();
    toggle(typeDD, typeSpan);
  });

  // Arrow 图标点击：down/up toggles 下拉，× 清除
  makeSpan.addEventListener('click', e => {
    e.stopPropagation();
    if (makeSpan.textContent === '') {
      // 清除选择
      makeBtn.querySelector('span').textContent = 'All makes';
      makeSpan.textContent = '';
      hide(makeDD, makeSpan);
    } else {
      // 切换下拉
      toggle(makeDD, makeSpan);
    }
  });
  typeSpan.addEventListener('click', e => {
    e.stopPropagation()
    if (typeSpan.textContent === '') {
      // 清除选择
      typeBtn.querySelector('span').textContent = 'All body types';
      typeSpan.textContent = '';
      hide(typeDD, typeSpan);
    } else {
      // 切换下拉
      toggle(typeDD, typeSpan);
    }
  });

  // Make 下拉项点击：选中并显示清除图标
  makeDD.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', e => {
      const sel = e.target.textContent.trim();
      makeBtn.querySelector('span').textContent = sel;
      makeSpan.textContent = '';
      hide(makeDD, makeSpan);
    });
  });

  // BodyType 下拉项点击：选中并显示清除图标
  typeDD.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', e => {
      const sel = e.target.textContent.trim();
      typeBtn.querySelector('span').textContent = sel;
      typeSpan.textContent = '';
      hide(typeDD, typeSpan);
    });
  });

  let carsData = [];
  fetch('cars.json')
    .then(res => res.json())
    .then(cars => {
      carsData = cars;
      renderCars(carsData);
    })
    .catch(console.error);

  function renderCars(list) {
    const container = document.getElementById('carList');
    if (!container) return;
    container.innerHTML = '';
    list.forEach(car => {
      const card = document.createElement('div');
      card.className = 'flex flex-col bg-white';
      card.innerHTML = `
          <div class="w-full pt-10 group overflow-hidden">
            <img src="${car.imageUrl}" alt="${car.brand} ${car.model}"
              class="w-2/3 h-auto mx-auto transform transition-transform duration-[500ms] group-hover:scale-120 group-hover:duration-[1000ms]">
          </div>
          <h3 class="font-extrabold text-2xl text-center pt-4">${car.brand} ${car.model}</h3>
          <div class="mx-auto text-sm pb-3">
            <span>${car.type}|</span>
            <span>${car.fuelType}</span>
          </div>
          <div class="flex justify-around px-1.5 mb-5">
            <span
              class="flex items-center justify-center w-16 h-6 bg-red-900 text-stone-50 text-sm font-bold select-none">$${car.pricePerDay} /
              Day</span>
            <span class="stock flex items-center justify-center h-6 text-sm font-medium select-none">${car.available ? 'IN STOCK' : 'OUT OF ORDER'}</span>
          </div>
          <button
            class="addToCart border border-red-900 w-44 h-8 mb-8 mx-auto font-bold text-red-900 hover:bg-red-900 hover:text-stone-50  cursor-pointer select-none">
            ${car.available ? '' : 'disabled'}
            ${car.available ? 'Booking Now' : 'Out of Order'}
          </button>
        `;
      container.appendChild(card);
    });
  }

  // 搜索自动补全
  const searchInput = document.querySelector('input[type="search"]');
  const searchBtn = document.querySelector('.searchBtn');
  const searchDropDown = document.querySelector('.searchDropDown');
  const searchDropUl = searchDropDown.querySelector('ul');
  // 初始隐藏
  searchDropDown.classList.add('hidden');

  function getSuggestions(query) {
    if (!query) return [];
    const low = query.toLowerCase();
    // 筛选范围
    let filtered = carsData;
    const selMake = makeBtn.querySelector('span').textContent;
    if (selMake !== 'All makes') filtered = filtered.filter(c => c.brand === selMake);
    const selType = typeBtn.querySelector('span').textContent;
    if (selType !== 'All body types') filtered = filtered.filter(c => c.type === selType);
    // 收集建议
    const set = new Set();
    filtered.forEach(c => {
      if (c.brand.toLowerCase().includes(low)) set.add(c.brand);
      if (c.model.toLowerCase().includes(low)) set.add(c.model);
      if (c.type.toLowerCase().includes(low)) set.add(c.type);
    });
    return [...set];
  }

  // 自动补全
  searchInput.addEventListener('input', () => {
    const val = searchInput.value.trim();
    const suggestions = getSuggestions(val);
    searchDropUl.innerHTML = suggestions.map(s => `<li class="flex items-center h-9 hover:underline cursor-pointer px-2">${s}</li>`).join('');
    if (suggestions.length && val) searchDropDown.classList.remove('hidden'); else searchDropDown.classList.add('hidden');

    // 点击建议时渲染对应列表
    searchDropUl.querySelectorAll('li').forEach(li => {
      li.addEventListener('click', () => {
        const key = li.textContent;
        searchInput.value = key;
        // 筛选逻辑
        const selMake = makeBtn.querySelector('span').textContent;
        const selType = typeBtn.querySelector('span').textContent;
        let filtered = carsData;
        if (selMake !== 'All makes') filtered = filtered.filter(c => c.brand === selMake);
        if (selType !== 'All body types') filtered = filtered.filter(c => c.type === selType);
        filtered = filtered.filter(c => c.brand === key || c.model === key || c.type === key);
        renderCars(filtered);
        searchDropDown.classList.add('hidden');
      });
    });
  });

  // 点击搜索或回车
  function handleSearch() {
    const val = searchInput.value.trim().toLowerCase();
    const selMake = makeBtn.querySelector('span').textContent;
    const selType = typeBtn.querySelector('span').textContent;
    if (!val && selMake === 'All makes' && selType === 'All body types') {
      renderCars(carsData);
      searchDropDown.classList.add('hidden'); return;
    }
    let filtered = carsData;
    if (selMake !== 'All makes') filtered = filtered.filter(c => c.brand === selMake);
    if (selType !== 'All body types') filtered = filtered.filter(c => c.type === selType);
    if (val) {
      filtered = filtered.filter(c => c.brand.toLowerCase().includes(val) || c.model.toLowerCase().includes(val) || c.type.toLowerCase().includes(val));
    }
    renderCars(filtered);
    searchDropDown.classList.add('hidden');
  }
  searchBtn.addEventListener('click', handleSearch);
  searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } });
});
