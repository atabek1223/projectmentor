// ? api для запроса

let API = "http://localhost:8000/posts";

let inp = document.querySelector(".inp");
let title = document.querySelector("#title");
let price = document.querySelector("#price");
let descr = document.querySelector("#descr");
let image = document.querySelector("#image");
let btnAdd = document.querySelector("#btn-add");
//? инпуты из модалки
let editTitle = document.querySelector("#edit-title");
let editPrice = document.querySelector("#edit-price");
let editDescr = document.querySelector("#edit-descr");
let editImage = document.querySelector("#edit-image");
let editSaveBtn = document.querySelector("#btn-save-edit");
let exampleModal = document.querySelector("#exampleModal");
// ? pagination

let currentPage = 1;
let pageTotalCount = 1;
let paginationList = document.querySelector(".pagination-list");
let prev = document.querySelector(".prev");
let next = document.querySelector(".next");
//? SEARCH
let searchInp = document.querySelector("#search");
let searchval = "";

//? блок куда добавяться карточки
let list = document.querySelector("#products-list");

btnAdd.addEventListener("click", async function () {
  // собираем обьект для добавление в дб джсон
  let obj = {
    title: title.value,
    price: price.value,
    descr: descr.value,
    image: image.value,
  };

  //  проверим создается ли он

  if (
    !obj.title.trim() ||
    !obj.descr.trim() ||
    !obj.image.trim() ||
    !obj.price.trim()
  ) {
    alert("Заполни все поля!");
    return;
  }

  //! запрос на добавление
  await fetch(API, {
    method: "POST",
    body: JSON.stringify(obj),
    headers: {
      "Content-type": "application/json",
    },
  });
  title.value = "";
  price.value = "";
  descr.value = "";
  image.value = "";

  render();
});

// ! отображение из json server
async function render() {
  let products = await fetch(
    `${API}?q=${searchval}&_page=${currentPage}&_limit=3`
  )
    .then((res) => res.json())
    .catch((err) => console.log(err)); // ловим ошибку
  drawPaginationButtons();

  list.innerHTML = "";
  products.forEach((element) => {
    let newElem = document.createElement("div");

    newElem.id = element.id;
    newElem.innerHTML = `
    <div class="card m-5" style="width: 18rem;">
    <img src=${element.image} class="card-img-top" alt="...">
    <div class="card-body">
      <h5 class="card-title">${element.title}</h5>
      <p class="card-text">${element.descr}</p>
      <p class="card-text">$ ${element.price}</p>
      <a href="#" id=${element.id} class="btn btn-danger btn-delete">DELETE</a>
      <a href="#" data-bs-toggle="modal" data-bs-target="#exampleModal" id=${element.id} class="btn btn-dark btn-edit">EDIT</a>
    </div>
  </div>`;
    list.append(newElem);
  });
}
render();

//! Удаление продукта
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-delete")) {
    let id = e.target.id;
    await fetch(`${API}/${id}`, {
      method: "DELETE",
    });
  }
  render();
});
//! Изменение продукта
//? открываем модалку
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("btn-edit")) {
    let id = e.target.id;
    fetch(`${API}/${id}`)
      .then((res) => res.json())
      .then((data) => {
        // ? заполняем все инпуты из модалки
        editTitle.value = data.title;
        editDescr.value = data.descr;
        editImage.value = data.image;
        editPrice.value = data.price;

        editSaveBtn.setAttribute("id", data.id);
      });
  }
});
editSaveBtn.addEventListener("click", function (e) {
  let id = this.id;
  let title = editTitle.value;
  let price = editPrice.value;
  let descr = editDescr.value;

  let image = editImage.value;
  if (!title || !descr || !price || !image) {
    return;
  }
  let editProduct = {
    title: title,
    descr: descr,
    price: price,
    image: image,
  };

  saveEdit(editProduct, id);
});

// ! Фунцция запроса для сохранения
function saveEdit(editProduct, id) {
  fetch(`${API}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(editProduct),
  }).then(() => {
    render();
  });

  //   let modal = bootstrap.Modal.getInstance(exampleModal);
  //   modal.hide();
}

// todo PAGINATION
function drawPaginationButtons() {
  console.log(currentPage);
  fetch(`${API}?q=${searchval}`)
    .then((res) => res.json())
    .then((data) => {
      pageTotalCount = Math.ceil(data.length / 3);
      // общее количество продуктов делим на кол-во продуктов которые отображаются на одной странице
      //pageTotalCount = кол-во страниц
      paginationList.innerHTML = "";
      for (let i = 1; i <= pageTotalCount; i++) {
        // создаем кнопки с цифрами
        // console.log(i);
        if (currentPage == i) {
          let page1 = document.createElement("li");
          page1.innerHTML = `<li class="page-item active">
          <a class="page-link page_number" href="#">${i}</a>
      </li>
  `;
          paginationList.append(page1);
        } else {
          let page2 = document.createElement("li");
          page2.innerHTML = `<li class="page-item ">
          <a class="page-link page_number" href="#">${i}</a>
      </li>
  `;
          paginationList.append(page2);
        }
      }

      if (currentPage == 1) {
        prev.classList.add("disabled");
      } else {
        prev.classList.remove("disabled");
      }

      if (currentPage == pageTotalCount) {
        next.classList.add("disabled");
      } else {
        next.classList.remove("disabled");
      }
    });
}

prev.addEventListener("click", () => {
  if (currentPage <= 1) {
    return;
  }
  currentPage--;
  render();
});

next.addEventListener("click", () => {
  if (currentPage >= pageTotalCount) {
    return;
  }
  currentPage++;
  render();
});

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("page_number")) {
    currentPage = e.target.innerText;
    render();
  }
});

// drawPaginationButtons();

// todo SEARCH
searchInp.addEventListener("input", () => {
  searchval = searchInp.value; //
  currentPage = 1;

  render();
});
