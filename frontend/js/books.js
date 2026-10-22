import {API} from "./config.js";
import {authFetch} from "./auth.js";
import {showError, extractErrorMessage} from "./errors.js";
import {openEditModal, closeEditModal, closeAddModal} from "./modals.js";

let allBooks = [];
let editingId = null;

function checkForHtmlSyntax(text)
{
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderBooks(books)
{
    const listDiv = document.getElementById('book-list');
    listDiv.innerHTML = '';

    books.forEach(book =>
    {
        listDiv.innerHTML +=
            `<div class="book-card">
				<div class="book-info">
					<strong>${checkForHtmlSyntax(book.title)}</strong>
					 <span class="author">by ${checkForHtmlSyntax(book.author)}</span>
					<br>
					<small>${checkForHtmlSyntax(book.genre)} ~ rating: ${book.rating}</small>
				</div>

				<div class="book-actions">
					<button data-action="edit" data-id="${book.id}">Edit</button>
					<button data-action="delete" data-id="${book.id}">Delete</button>
				</div>
			</div>`;
    });
}
export async function loadBooks()
{
    const response = await authFetch(`${API}/books`);
    if(!response.ok) return;
    allBooks = await response.json();
    renderBooks(allBooks);
}
export function clearBooks()
{
    allBooks = [];
    document.getElementById('book-list').innerHTML = '';
}

// SEARCH FOR A BOOK
document.getElementById('search-box').addEventListener(
    'input', function()
    {
        const query = this.value.toLowerCase();

        const filtered = allBooks.filter(book => book.title.toLowerCase().includes(query));

        renderBooks(filtered);
    });

// ADD NEW BOOK
document.getElementById('add-book-form').addEventListener(
    'submit', async function(event)
    {
        event.preventDefault();

        const newBook =
            {
                title: document.getElementById('title').value,
                author: document.getElementById('author').value,
                genre: document.getElementById('genre').value,
                rating: parseInt(document.getElementById('rating').value)
            };

        const response = await authFetch(`${API}/books`,
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(newBook)
            });

        if(!response.ok)
        {
            const error = await response.json();
            showError(extractErrorMessage(error));
            return;
        }

        document.getElementById('add-book-form').reset();

        loadBooks();
        closeAddModal();
    });

// UPDAT BOOK
document.getElementById('edit-book-form').addEventListener(
    'submit', async function(event)
    {
        event.preventDefault();

        const updatedBook =
            {
                title: document.getElementById('edit-title').value,
                author: document.getElementById('edit-author').value,
                genre: document.getElementById('edit-genre').value,
                rating: parseInt(document.getElementById('edit-rating').value)
            };

        const response = await authFetch(`${API}/books/${editingId}`,
            {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(updatedBook)
            }
        );

        if(!response.ok)
        {
            const error = await response.json();
            showError(extractErrorMessage(error));
            return;
        }

        document.getElementById('edit-book-form').reset();
        loadBooks();
        closeEditModal();
    });

// EDIT AND DELETE BUTTON LISTENER
document.getElementById('book-list').addEventListener('click',
    function(event)
    {
        const button = event.target.closest('button[data-action]');
        if(!button) return;

        const id = Number(button.dataset.id);

        if(button.dataset.action === 'edit') startEdit(id);
        if(button.dataset.action === 'delete') deleteBook(id);
    })

// SET UP EDIT MODAL
function startEdit(id)
{
    const book = allBooks.find(book => book.id === id);

    editingId = id;
    document.getElementById('edit-title').value = book.title;
    document.getElementById('edit-author').value = book.author;
    document.getElementById('edit-genre').value = book.genre;
    document.getElementById('edit-rating').value = book.rating;
    openEditModal();

}

// DELETE BOOK
async function deleteBook(bookId)
{
    const confirmed = confirm('Are you sure you want to delete this book?');

    if(!confirmed) return;

    const response = await authFetch(`${API}/books/${bookId}`,
        {method: 'DELETE'});

    if(!response.ok)
    {
        const error = await response.json();
        showError(extractErrorMessage(error));
        return;
    }

    loadBooks();
}