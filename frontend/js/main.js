import {showError} from "./errors.js";
import {openAddModal, closeAddModal, openEditModal, closeEditModal} from "./modals.js";
import {loadGenres, setupGenrePicker} from "./genres.js";
import{get_token, authenticate, setSessionExpiredHandler} from "./auth.js";
import {clearBooks, loadBooks} from "./books.js";

// AUTHENTICATION FUNCTIONS
function showAuth()
{
	document.getElementById('auth-section').classList.remove('hidden');
	document.getElementById('app-section').classList.add('hidden');
}
function showApp()
{
	document.getElementById('app-section').classList.remove('hidden');
	document.getElementById('auth-section').classList.add('hidden');

	loadBooks();
}

function logout()
{
	localStorage.removeItem('token');
	clearBooks();
	showAuth();
}
async function doLogin()
{
	const data = await authenticate("/login");
	if(!data) return;

	localStorage.setItem('token', data.access_token);
	document.getElementById('auth-form').reset();
	showApp();
}

// LOG IN AND REGISTER BUTTONS ACTIVATION
document.getElementById('auth-form').addEventListener(
	'submit', function(event)
{
	event.preventDefault();
	doLogin();
});
document.getElementById('register-button').addEventListener(
	'click', async function(){
		const created = await authenticate("/register");
		if (created) doLogin();
	});

loadGenres();
setupGenrePicker('genre', 'genre-options');
setupGenrePicker('edit-genre', 'edit-genre-options');


Object.assign(window, {
	openAddModal, closeAddModal, closeEditModal, logout
});
setSessionExpiredHandler(() =>{
	logout();
	showError('Session expired. Please log in again.');
})

if (get_token()) { showApp(); } else { showAuth(); }