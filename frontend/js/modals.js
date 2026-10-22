export function openAddModal()
{
    document.getElementById('add-modal-overlay').classList.add('active');
}

export function closeAddModal()
{
    document.getElementById('add-modal-overlay').classList.remove('active');
    document.getElementById('add-book-form').reset();
}

export function openEditModal()
{
    document.getElementById('edit-modal-overlay').classList.add('active');
}

export function closeEditModal()
{
    document.getElementById('edit-modal-overlay').classList.remove('active');
    document.getElementById('edit-book-form').reset();
}