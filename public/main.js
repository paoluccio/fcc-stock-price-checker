window.onload = () => {

  const mainContent = document.querySelector('.main-content');
  const form = document.forms[0];
  const spinner = document.querySelector('.spinner');
  const likeCheckbox = document.getElementById('like');
  const error = document.querySelector('.error');

  function getStockDetails(e) {
    e.preventDefault();
    const [symbols, like] = [this.symbols.value.trim(), this.like.checked]
    likeCheckbox.checked = false;
    if (!symbols) return;
    fadeOut(error);
    fadeOut(mainContent);
    fadeIn(spinner);
    fetch(`/api/stock-prices?symbol=${symbols}${like ? '&like=true' : ''}`)
      .then(response => response.json())
      .then(result => {
        if (result.error) {
          fadeOut(spinner);
          fadeIn(error);
        } else {
          render(result);
        }
      })
      .catch(err => console.log(err));
  }

  function render(data) {
    mainContent.innerHTML = data.map(stock => `
      <div class="element">
        <div class="price-and-likes">
          <a href="https://iextrading.com/developer" target="_blank">IEX Real-Time Price</a>
          <p class="price">${stock.latestPrice}</p>
          <p class="likes">
            <i class="far fa-thumbs-up like-icon"></i>
            <span class="like-counter">${stock.likes}</span>
            <span class="likes-difference">${stock.likes_difference ? `(${stock.likes_difference})` : ''}</span>
          </p>
        </div>
        <p><span class="field">Symbol:</span> <span class="symbol">${stock.symbol.toUpperCase()}</span></p>
        <p><span class="field">Company name:</span> ${stock.companyName}</p>
        <p><span class="field">Sector:</span> ${stock.sector ? stock.sector : 'N/A'}</p>
        <p><span class="field">Industry:</span> ${stock.industry ? stock.industry : 'N/A'}</p>
        <p><span class="field">CEO:</span> ${stock.CEO ? stock.CEO : 'N/A'}</p>
        <p><span class="field">Website:</span> ${stock.website ? `<a href="${stock.website}" target="_blank">${stock.website}</a>` : 'N/A'}</p>
        <p><span class="field">Description:</span> ${stock.description ? stock.description : 'N/A'}</p>
      </div>`);
    fadeIn(mainContent);
    fadeOut(spinner);
  }

  function fadeIn(element) {
    element.style.display = 'block';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        element.classList.add('visible');
      })
    });
  }

  function fadeOut(element) {
    element.classList.remove('visible');
    setTimeout(() => element.style.display = 'none', 100);
  };

  form.addEventListener('submit', getStockDetails);
}