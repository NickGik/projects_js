document.addEventListener('DOMContentLoaded', function() {
    const API_URL = 'http://localhost:3000/api/clients';
    const searchInput = document.querySelector('.form__search');
    const headingTables = document.querySelectorAll('.clients__text');
    const sortableHeaders = document.querySelectorAll('.sortable-header');
    const contentTable = document.querySelector('.adaptive-block');
    let debounceTimer;
    let currentSortColumn = -1; 
    let isAscending = true; 


    document.getElementById('table-header').addEventListener('click', function (event) {
        if (event.target.classList.contains('sortable-header')) {
            const columnIndex = event.target.getAttribute('data-column-index');
            sortTable(columnIndex);
        }
    });
    

    async function clientsTable() {
        const clients = await getClientList({ search: '' });

        const tableBody = document.querySelector('.clients__tbody');
        tableBody.innerHTML = '';

        for (const client of clients) {

            const row = tableBody.insertRow();
            row.classList.add('clients__tr');

            const reqId = client.id;
            const idClient = String(parseInt(reqId, 10)).slice(0, 8);

            const fullName = `${capitalizeFirstLetter(client.surname)} ${capitalizeFirstLetter(client.name)} ${capitalizeFirstLetter(client.lastName)}`;

            function capitalizeFirstLetter(str) {
                if (str) {
                    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
                } else {
                    return '';
                }
            }

            const timeCreation = formatDateTime(client.createdAt);
            const lastChange = formatDateTime(client.updatedAt);

            const formSelectBlock = document.createElement('ul');
            formSelectBlock.classList.add('socials-block');

            const iconsToShow = 4;
            const allIcons = client.contacts.map(contact => {
                const iconSocial = document.createElement('li');
                const linkSocial = document.createElement('a');
                linkSocial.classList.add('icons', 'tooltip-container');

                const imgSocial = document.createElement('img');
                imgSocial.classList.add('icon-social'); 
                imgSocial.setAttribute('width', '16');
                imgSocial.setAttribute('height', '16');
                imgSocial.setAttribute('src', `img/socials/${contact.type}.png`);

                linkSocial.append(imgSocial);

                linkSocial.setAttribute('href', contact.link);
                linkSocial.setAttribute('data-tooltip-type', contact.type);
                linkSocial.setAttribute('data-tooltip-value', contact.value);
   
                iconSocial.append(linkSocial);

                return iconSocial;
            });

            allIcons.forEach(icon => {
                formSelectBlock.append(icon);
            });

            const socialsCell = row.insertCell();
            socialsCell.append(formSelectBlock);
        
            if (client.contacts.length > iconsToShow) {
                const shortIcons = client.contacts.slice(0, iconsToShow).map(contact => {
                    const iconSocial = document.createElement('li');
                    const linkSocial = document.createElement('a');
                    linkSocial.classList.add('icons', 'tooltip-container');
            
                    const imgSocial = document.createElement('img');
                    imgSocial.classList.add('icon-social'); 
                    imgSocial.setAttribute('width', '16');
                    imgSocial.setAttribute('height', '16');
                    imgSocial.setAttribute('src', `img/socials/${contact.type}.png`);

                    linkSocial.append(imgSocial);

                    linkSocial.setAttribute('href', contact.link);
                    linkSocial.setAttribute('data-tooltip-type', contact.type);
                    linkSocial.setAttribute('data-tooltip-value', contact.value);
    
                    iconSocial.append(linkSocial);
                    return iconSocial;
                });
            
                const betweenIcons = client.contacts.length - iconsToShow;
            
                const showMoreButton = document.createElement('button');
                showMoreButton.classList.add('btn-addIcons');
                showMoreButton.textContent = `+${betweenIcons}`;
                showMoreButton.addEventListener('click', function () {
                    formSelectBlock.innerHTML = allIcons.map(icon => icon.outerHTML).join('');
                    addTooltipEventListeners(formSelectBlock);
                });
            
                formSelectBlock.innerHTML = shortIcons.map(icon => icon.outerHTML).join('');
                addTooltipEventListeners(formSelectBlock);
            
                formSelectBlock.append(showMoreButton);
            } else {
                formSelectBlock.innerHTML = allIcons.map(icon => icon.outerHTML).join('');
                addTooltipEventListeners(formSelectBlock);
            }
            
            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);
            const cell3 = row.insertCell(2);
            const cell4 = row.insertCell(3);
            const cell5 = row.insertCell(4);
            const cell6 = row.insertCell(5);
            // const cell7 = row.insertCell(6);

            cell1.classList.add('clients__td', 'clients__td-id');
            cell2.classList.add('clients__td');
            cell3.classList.add('clients__td');
            cell4.classList.add('clients__td');
            cell5.classList.add('clients__td');
            cell6.classList.add('clients__td', 'clients__td-flex');
            // cell7.classList.add('clients__td');

            cell1.innerHTML = idClient;
            cell2.innerHTML = fullName;
            cell3.innerHTML = '';
            cell4.innerHTML = '';

            const timeCreationBlock = document.createElement('div');
            timeCreationBlock.className = 'data-block';

            cell3.append(timeCreationBlock);

            timeCreation.forEach(element => {
                timeCreationBlock.append(element);
            });

            const lastChangeBlock = document.createElement('div');
            lastChangeBlock.className = 'data-block';

            cell4.append(lastChangeBlock);

            lastChange.forEach(element => {
                lastChangeBlock.append(element);
            });

            cell5.append(formSelectBlock); 

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('deleteBtn');
            
            const IconDel = document.createElement('img');
            IconDel.classList.add('icon-deleteBtn');

            IconDel.setAttributeNS(null, 'width', '12');
            IconDel.setAttributeNS(null, 'height', '12');
            IconDel.setAttribute('src', `img/del.png`);

            const spanTextDel = document.createElement('span');
            spanTextDel.textContent = "Удалить";

            deleteBtn.append();
            deleteBtn.append(IconDel, spanTextDel);

            deleteBtn.setAttribute('data-client-id', client.id);

            deleteBtn.addEventListener('click', async () => {
                deleteImgActive('spin');
                const modalContainer = document.querySelector('.modal-container');
                modalContainer.classList.add('modal-container_active');
            
                const confirmationModal = createConfirmationModal();
                modalContainer.append(confirmationModal);
            
                const confirmDeleteBtn = confirmationModal.querySelector('#confirmDeleteBtn');
            
                confirmDeleteBtn.addEventListener('click', async () => {
                    
                    const clientId = deleteBtn.getAttribute('data-client-id');
                
                    try {
                        const response = await fetch(`${API_URL}/${clientId}`, {
                            method: 'DELETE',
                        });
                
                        if (response.ok) {
                            const rowToRemove = deleteBtn.parentElement.parentElement;
                            if (rowToRemove) {
                                rowToRemove.remove();
                            }

                        } else {
                            console.error('Failed to delete client.');

                        }
                    } catch (error) {
                        console.error('Error sending delete request:', error);
                    }
                    closeModal();
                });
            });

            function stopSpin() {
                let animStop = document.querySelector('.btn-spin');
                animStop.classList.add('btn-spin_stop');
            }

            function createConfirmationModal() {
                const modalContent = document.querySelector('.modal');
                modalContent.classList.add('modal-del');
                const heading = document.createElement('p');
                heading.classList.add('modal-del__heading');
                const message = document.createElement('p');
                message.classList.add('modal-del__text');
                const confirmBtn = document.createElement('button'); 
                confirmBtn.classList.add('saveBtn');
                const cancelBtn = document.createElement('button');
                cancelBtn.classList.add('cancelBtn');
            
                confirmBtn.id = 'confirmDeleteBtn';
                confirmBtn.textContent = 'Удалить';
            
                cancelBtn.id = 'cancelDeleteBtn';
                cancelBtn.textContent = 'Отмена';
            
                heading.textContent = 'Удалить клиента';
                message.textContent = 'Вы действительно хотите удалить данного клиента?';
        
                const closeButton = document.createElement('button');
                closeButton.classList.add('modal__btn-close');

                modalContent.append(heading, message, confirmBtn, cancelBtn, closeButton);
        
                const svgIconClose = document.createElement('img');//1
                svgIconClose.classList.add('icon-contact');
        
                svgIconClose.setAttributeNS(null, 'width', '17');
                svgIconClose.setAttributeNS(null, 'height', '17');
                svgIconClose.setAttribute('src', `img/close.png`);
        
        
                closeButton.addEventListener('mouseenter', function () {
                    svgIconClose.setAttribute('src', `img/close-hover.png`);
                });
                
                closeButton.addEventListener('mouseleave', function () {
                    svgIconClose.setAttribute('src', `img/close.png`);
                });
            
                closeButton.append(svgIconClose);
        
                function closeModal() {
                    const modalContainer = document.querySelector('.modal-container');
                    modalContainer.classList.remove('modal-container_active');
                    modalContent.classList.remove('modal-del');
                    modalContent.innerHTML = '';
                    contentTable.classList.remove('scroll-hidden');
                }
              
                cancelBtn.addEventListener('click', () => {
                    deleteImgActive('del');
                    stopSpin()
                    closeModal(); 
                });
            
                closeButton.addEventListener('click', () => {
                    deleteImgActive('del');
                    stopSpin()
                    closeModal(); 
                });
            
                return modalContent;
            }
        

            function closeModal() {
                const modalContainer = document.querySelector('.modal-container');
                modalContainer.classList.remove('modal-container_active');
                const modalContent = document.querySelector('.modal');
                modalContent.innerHTML = '';
                const modalDel = document.querySelector('.modal-del');
                modalDel.classList.remove('modal-del');
                contentTable.classList.remove('scroll-hidden');
            };

            cell6.append(deleteBtn);

            function deleteImgActive(img) {
                const imgName = img;
                const imgDel = document.createElement('img');
                imgDel.classList.add('btn-spin');
            
                imgDel.setAttributeNS(null, 'width', '12');
                imgDel.setAttributeNS(null, 'height', '12');
                imgDel.setAttribute('src', `img/${imgName}.png`);
                        
                const spanTextEdit = document.createElement('span');
                spanTextEdit.textContent = "Удалить";
            
                deleteBtn.innerHTML = '';
                deleteBtn.append(imgDel, spanTextEdit);
            }

            const changeBtn = document.createElement('button');
            changeBtn.classList.add('changeBtn');

            const IconEdit = document.createElement('img');
            IconEdit.classList.add('icon-changeBtn');

            IconEdit.setAttribute(null, 'width', '12');
            IconEdit.setAttribute(null, 'height', '12');
            IconEdit.setAttribute('src', `img/edit.png`);

            const spanTextEdit = document.createElement('span');
            spanTextEdit.textContent = "Изменить";

            changeBtn.append(IconEdit, spanTextEdit);

            changeBtn.setAttribute('data-client-id', client.id);

            changeBtn.addEventListener('click', async () => {
                changeImgActive('spin');

                const clientId = changeBtn.getAttribute('data-client-id');
                const clientData = await getClientDataById(clientId);

                openEditModal(clientData, spanTextEdit);
            });

            cell6.append(changeBtn);

            function changeImgActive(img) {
                const imgName = img;
                const IconEdit = document.createElement('img');
                IconEdit.classList.add('btn-spin');
            
                IconEdit.setAttribute(null, 'width', '12');
                IconEdit.setAttribute(null, 'height', '12');
                IconEdit.setAttribute('src', `img/${imgName}.png`);
            
                const spanTextEdit = document.createElement('span');
                spanTextEdit.textContent = "Изменить";
            
                changeBtn.innerHTML = '';
                changeBtn.append(IconEdit, spanTextEdit);
            }

            function openEditModal(clientData) {
                const clientId = clientData.id;
                const editClientsForm = document.createElement('form');
                editClientsForm.id = 'editClientForm';
                editClientsForm.classList.add('form');
        
                editClientsForm.addEventListener('submit', function (event) {
                    event.preventDefault();
        
                     addClientData();
                });
        
                async function addClientData() {
                    const formData = {
                        surname: inputs[0].value,
                        name: inputs[1].value,
                        lastName: inputs[2].value,
                        contacts: [],
                    };

                    formData.contacts = addedContactForms.map((contactForm) => {
                        const contactType = contactForm.querySelector('select').value;
                        const contactValue = contactForm.querySelector('input').value;
                        return {
                            type: contactType,
                            value: contactValue,
                        };
                    });
                
                    const errorBlock = document.querySelector('.error-div');//9
                    
                    function formInputsErrors() {
                        const inputsNames = Array.from({ length: 3 }, (_, index) => `input-${index + 1}`);
                        const formInputs = document.querySelectorAll('.form__input');
                        const errorBlock = document.querySelector('.error-div');
                    
                        formInputs.forEach((input, index) => {
                            input.id = inputsNames[index];
                            input.addEventListener('input', () => {
                                const trimmedValue = input.value.trim(); 
                                const isInputEmpty = trimmedValue === '';
                                input.style.borderColor = isInputEmpty ? 'red' : '';
                                errorBlock.textContent = isInputEmpty ? 'Фамилия и Имя должны быть заполнены!' : '';
                            });
                        });
                    
                        if (formInputs[0].value.trim() === '' || formInputs[1].value.trim() === '') {
                            formInputs[0].style.borderColor = 'red';
                            formInputs[1].style.borderColor = 'red';
                            errorBlock.textContent = 'Фамилия и Имя должны быть заполнены!';
                        }
                    }                    
                
                    function formContactErrors() {
                        const contactInputs = document.querySelectorAll('.form__input-contact');
                
                        const allContactsFilled = Array.from(contactInputs).every((input) => input.value.trim() !== '');
                
                        if (!allContactsFilled) {
                            errorBlock.textContent = 'Все контактные данные должны быть заполнены!';
                            contactInputs.forEach((contactInput) => {
                                if (!contactInput.value.trim()) {
                                    contactInput.style.borderColor = 'red';
                                    return;
                                } else {
                                    contactInput.style.borderColor = '';
                                }
                            });
                        } else {
                            errorBlock.textContent = '';
                            contactInputs.forEach((contactInput) => {
                                contactInput.style.borderColor = '';
                            });
                        }
                    };
                
                    try {
                            const response = await fetch(`http://localhost:3000/api/clients/${clientData.id}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(formData),
                        });

                        console.log('Response status:', response.status);

                        const responseBody = await response.json();
                        console.log('Response body:', responseBody);
        
                        if (response.status === 200) {
                            clientsTable();
                            closeModal();
                        } else {
                            formContactErrors();
                            formInputsErrors();
                        }
                    } catch (error) {
                        formContactErrors();
                        formInputsErrors();
                    }
                };
        
            
                const inputBlock = document.createElement('div'); //INPUT
                inputBlock.classList.add('form__input-block');
        
                const contactBlock = document.createElement('div'); //CONTACT
                contactBlock.classList.add('form__contact-block');
        
                const buttonBlock = document.createElement('div'); //BUTTON
                buttonBlock.classList.add('form__btn-block');

                editClientsForm.append(inputBlock, contactBlock, buttonBlock);
        
        
                const textOfEdit = document.createElement('p');
                textOfEdit.classList.add('form__text');
        
                const textSpan = document.createElement('span');
                textSpan.classList.add('form__text-span');
                textSpan.textContent = `ID: ${clientId}`;
        
                textOfEdit.textContent = 'Изменить данные ';
                textOfEdit.append(textSpan);
        
                inputBlock.append(textOfEdit);
        
                const inputs = Array.from({ length: 3 }, (_, index) => {
                    return createInput(inputBlock, index, clientData);
                });
        
                function createInput(parent, index, clientData) {
                    const wrapperDiv = document.createElement('div');
                    wrapperDiv.className = 'input-wrapper';
                
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.className = 'form__input';
                    input.id = `input-${index + 1}`;
                    input.setAttribute('aria-label', `Строка для заполнения ${['Фамилии', 'Имени', 'Отчества'][index]}`);
        
                    const placeHolder = document.createElement('div');
                    placeHolder.textContent = `${['Фамилия', 'Имя', 'Отчество'][index]}`;
                    placeHolder.className = 'placeholder';
                    const spanStar = document.createElement('span');
                    spanStar.textContent = '*';
                    spanStar.className = 'star';
                
                    const label = document.createElement('label');
                    label.className = 'form__label-change';
                    label.textContent = `${['Фамилия', 'Имя', 'Отчество'][index]}`;
                    const labelStar = document.createElement('span');
                    labelStar.textContent = '*';
                    labelStar.className = 'star';
                
                    input.value = clientData ? clientData[Object.keys(clientData)[index]] : '';
                
                    label.style.visibility = 'visible';
                    placeHolder.style.visibility = 'hidden';
                
                    label.addEventListener('click', () => {
                        input.focus();
                    });
                
                    input.addEventListener('input', () => {
                        label.style.visibility = input.value.trim() === '' ? 'hidden' : 'visible';
                        placeHolder.style.visibility = input.value.trim() === '' ? 'visible' : 'hidden';
                    });
                
                    const starWrap = document.createElement('div');
                    starWrap.className = 'star-wrap';
                
                    wrapperDiv.append(input, placeHolder, label);
                
                    if (index === 0 || index === 1) {
                        placeHolder.append(spanStar);
                        label.append(labelStar);
                    }
                
                    parent.append(wrapperDiv);
                
                    return input;
                }
            
                const formSelectBlock = document.createElement('div');
                formSelectBlock.classList.add('forn__select-block');
                contactBlock.append(formSelectBlock);
            
                const addedContactForms = [];  
        
                const addContactButton = document.createElement('button');
                addContactButton.classList.add('addContact');
                addContactButton.style.marginTop = '25px';
                addContactButton.style.marginBottom = '17px';
        
                const IconAddContact = document.createElement('img');
                IconAddContact.classList.add('icon-contact');
        
                IconAddContact.setAttributeNS(null, 'width', '13');
                IconAddContact.setAttributeNS(null, 'height', '13');
                IconAddContact.setAttribute('src', `img/contact.png`);
        
                const spanTextContact = document.createElement('span');
                spanTextContact.textContent = "Добавить контакт";
        
                addContactButton.append(IconAddContact, spanTextContact);
        
                addContactButton.addEventListener('mouseenter', function () {
                    IconAddContact.setAttribute('src', `img/contact-hover.png`);
                });
                
                addContactButton.addEventListener('mouseleave', function () {
                    IconAddContact.setAttribute('src', `img/contact.png`);
                });
            
                const maxContactForms = 10; 
        
                addContactButton.addEventListener('click', async (event) => {
                    event.preventDefault(); 
        
                    if (addedContactForms.length >= maxContactForms) {
                        alert('Достигнуто максимальное количество контактов (10).');
                        return;
                    }
        
                    const addClientContact = createContactForm({
                        'Телефон': 'phone',
                        'Доп. телефон': 'additionalPhone',
                        'VK': 'vk',
                        'Email': 'email',
                        'Twitter': 'twitter',
                        'Facebook': 'facebook',
                        'Другое': 'other'
                    });
        
                    addedContactForms.push(addClientContact);
        
                    formSelectBlock.append(addClientContact, addContactButton); 
        
                    const closeButton = addClientContact.querySelector('button');
                    closeButton.addEventListener('click', () => {
                        const index = addedContactForms.indexOf(addClientContact);
                        if (index !== -1) {
                            addedContactForms.splice(index, 1);
                        }
                    });
        
                }); 
        
                function checkAndToggleAddContactButton() {
                    if (addedContactForms.length >= maxContactForms) {
                        addContactButton.disabled = true; 
                    } else {
                        addContactButton.disabled = false;  
                    }
                }
        
                checkAndToggleAddContactButton();
        
                formSelectBlock.append(addContactButton);
        
                if (clientData && clientData.contacts) {
                    clientData.contacts.forEach(contact => {
                        const addClientContact = createContactForm({
                            'Телефон': 'phone',
                            'Доп. телефон': 'additionalPhone',
                            'VK': 'vk',
                            'Email': 'email',
                            'Twitter': 'twitter',
                            'Facebook': 'facebook'
                        }, contact);
        
                        addedContactForms.push(addClientContact);
        
                        formSelectBlock.append(addClientContact, addContactButton); 
        
                        const closeButton = addClientContact.querySelector('button');
                        closeButton.addEventListener('click', () => {
                            const index = addedContactForms.indexOf(addClientContact);
                            if (index !== -1) {
                                addedContactForms.splice(index, 1);
                            }
        
                            if (formSelectBlock.contains(addClientContact)) {
                                formSelectBlock.removeChild(addClientContact);
                            }
                        });
                    });
                }
        
                const errorBlock = document.createElement('div');
                errorBlock.className = 'error-div';
            
                const saveButton = document.createElement('button');
                saveButton.classList.add('saveBtn');
                saveButton.textContent = 'Сохранить';
        
                inputs[0].addEventListener('input', clearError);
                inputs[1].addEventListener('input', clearError);
            
                saveButton.addEventListener('submit', editClientsForm);
        
                function clearError() {
                    errorBlock.textContent = ''; 
                }

                const cancelButton = document.createElement('button');
                cancelButton.classList.add('cancelBtn');
                cancelButton.textContent = 'Отмена';

                buttonBlock.append(errorBlock, saveButton, cancelButton);
            
                cancelButton.addEventListener('click', () => {
                    changeImgActive('edit');
                    stopSpin();//4
                    closeModal();
                });
                
                const closeButton = document.createElement('button');
                    closeButton.classList.add('modal__btn-close');
                    editClientsForm.append(closeButton);
        
                    const IconCloseBtn = document.createElement('img');
                    IconCloseBtn.classList.add('icon-contact');
        
                    IconCloseBtn.setAttributeNS(null, 'width', '17');
                    IconCloseBtn.setAttributeNS(null, 'height', '17');
                    IconCloseBtn.setAttribute('src', `img/close.png`);
        
                    addContactButton.append(IconCloseBtn);
        
                    closeButton.addEventListener('mouseenter', function () {
                        IconCloseBtn.setAttribute('src', `img/close-hover.png`);
                    });
                    
                    closeButton.addEventListener('mouseleave', function () {
                        IconCloseBtn.setAttribute('src', `img/close.png`);
                    });
                
                    closeButton.append(IconCloseBtn);
        
                    function stopSpin() {
                        let animStop = document.querySelector('.btn-spin');
                        animStop.classList.add('btn-spin_stop');
                    }
        
                    function closeModal() {
                        const modalContainer = document.querySelector('.modal-container');
                        modalContainer.classList.remove('modal-container_active');
                        const modalContent = document.querySelector('.modal');
                        modalContent.innerHTML = '';
                        contentTable.classList.remove('scroll-hidden');
                    }
                
                    closeButton.addEventListener('click', () => {
                        changeImgActive('edit');
                        stopSpin();
                        closeModal(); 
                });
        
                openModal(editClientsForm);
            }
        }
    }
    

    async function loadTable() {
        const clients = await getClientList({ search: '' });
        showLoadingIndicator();

        hideLoadingIndicator();

        clientsTable()
    
        const addButton = document.createElement('button');
        addButton.id = "addBtn";
        addButton.classList.add('form__btn');

        const IconAdd = document.createElement('img');
        IconAdd.classList.add('icon-addBtn');

        IconAdd.setAttributeNS(null, 'width', '22');
        IconAdd.setAttributeNS(null, 'height', '16');
        IconAdd.setAttribute('src', `img/add.png`);

        const spanTextAdd = document.createElement('span');
        spanTextAdd.textContent = "Добавить клиента";

        addButton.append(IconAdd, spanTextAdd);

        addButton.addEventListener('mouseenter', function () {
            IconAdd.setAttribute('src', `img/add.png`);
        });
        
        addButton.addEventListener('mouseleave', function () {
            IconAdd.setAttribute('src', `img/add.png`);
        });


        addButton.addEventListener('click', () => {
            contentTable.classList.add('scroll-hidden');

            const addClientsForm = document.createElement('form');
            addClientsForm.id = 'addClientForm';
            addClientsForm.classList.add('form');

            addClientsForm.addEventListener('submit', function (event) {
                event.preventDefault();

                 addClientData();
            });


            async function addClientData() {
                const errorBlock = document.querySelector('.error-div');

                function isValidEmail(email) {
                    // Регулярное выражение для проверки корректности email
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    return emailRegex.test(email);
                }

                const formData = {
                    surname: inputs[0].value,
                    name: inputs[1].value,
                    lastName: inputs[2].value,
                    contacts: [],
                };
            
                formData.contacts = addedContactForms.map((contactForm) => {
                    const contactType = contactForm.querySelector('select').value;
                    const contactValue = contactForm.querySelector('input').value;

                    const input = document.querySelector('.form__input');


                    // Проверка корректности email перед добавлением в массив
                    if (contactType === 'email' && !isValidEmail(contactValue)) {
                        // Вывести сообщение об ошибке или выполнить другие действия при некорректном email
                        alert('Некорректный email');
                        input.style.borderColor = 'red';
                        

                        return null; // или вернуть undefined, чтобы исключить этот контакт из массива
                    }
            
                    return {
                        type: contactType,
                        value: contactValue,
                        image: contactType, 
                    };
                });
          
             

                function formInputsErrors() {
                    const inputsNames = Array.from({ length: 3 }, (_, index) => `input-${index + 1}`);
                    const formInputs = document.querySelectorAll('.form__input');
                    const errorBlock = document.querySelector('.error-div');
                
                    formInputs.forEach((input, index) => {
                        input.id = inputsNames[index];
                        input.addEventListener('input', () => {
                            const trimmedValue = input.value.trim(); 
                            const isInputEmpty = trimmedValue === '';
                            input.style.borderColor = isInputEmpty ? 'red' : '';
                            errorBlock.textContent = isInputEmpty ? 'Фамилия и Имя должны быть заполнены!' : '';
                        });
                    });
                
                    if (formInputs[0].value.trim() === '' || formInputs[1].value.trim() === '') {
                        formInputs[0].style.borderColor = 'red';
                        formInputs[1].style.borderColor = 'red';
                        errorBlock.textContent = 'Фамилия и Имя должны быть заполнены!';
                    }
                };

                function resetForm() {
                    const form = document.querySelector('form');
                    form.reset();
                }

                function formContactErrors() {
                    const contactInputs = document.querySelectorAll('.form__input-contact');
            
                    const allContactsFilled = Array.from(contactInputs).every((input) => input.value.trim() !== '');
            
                    if (!allContactsFilled) {
                        errorBlock.textContent = 'Все контактные данные должны быть заполнены!';
                        contactInputs.forEach((contactInput) => {
                            if (!contactInput.value.trim()) {
                                contactInput.style.borderColor = 'red';
                                return;
                            } else {
                                contactInput.style.borderColor = '';
                            }
                        });
                    } else {
                        errorBlock.textContent = '';
                        contactInputs.forEach((contactInput) => {
                            contactInput.style.borderColor = '';
                        });
                    }
                };
            
                try {
                    const response = await fetch(API_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(formData),
                    });

                    if (response.status === 201) {
                        resetForm();
                        console.log(formData);
                        const newClient = response;
                        clients.push(newClient);
                        clientsTable();
                        closeModal();
                    } else {
                        formContactErrors();
                        formInputsErrors();
                    }
                } catch (error) {
                    formContactErrors();
                    formInputsErrors();
                }
            };

            const formInputBlock = document.createElement('div');
            formInputBlock.classList.add('form__input-block');

            const formSelectBlock = document.createElement('div');
            formSelectBlock.classList.add('forn__select-block');

            const formBtnBlock =document.createElement('div');
            formBtnBlock.classList.add('form__btn-block');

            addClientsForm.append(formInputBlock, formSelectBlock, formBtnBlock);
        
            const textOfForm = document.createElement('p');
            textOfForm.classList.add('form__text');
            textOfForm.textContent = "Новый клиент";
            formInputBlock.append(textOfForm);

            let clientData;

            const inputs = Array.from({ length: 3 }, (_, index) => {
                return createInput(formInputBlock, index, clientData);
            });

            function createInput(parent, index, clientData) {
                const wrapperDiv = document.createElement('div');
                wrapperDiv.className = 'input-wrapper';
            
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'form__input';
                input.id = `input-${index + 1}`;
                input.setAttribute('aria-label', `Строка для заполнения ${['Фамилии', 'Имени', 'Отчества'][index]}`);

                const placeHolder = document.createElement('div');
                placeHolder.textContent = `${['Фамилия', 'Имя', 'Отчество'][index]}`;
                placeHolder.className = 'placeholder';
                const spanStar = document.createElement('span');
                spanStar.textContent = '*';
                spanStar.className = 'star';
            
                const label = document.createElement('label');
                label.className = 'form__label';
                label.textContent = `${['Фамилия', 'Имя', 'Отчество'][index]}`;
                const labelStar = document.createElement('span');
                labelStar.textContent = '*';
                labelStar.className = 'star';
            
                input.value = clientData ? clientData[Object.keys(clientData)[index]] : '';
            
                label.style.visibility = 'hidden';
            
                label.addEventListener('click', () => {
                    input.focus();
                });
            
                input.addEventListener('input', () => {
                    label.style.visibility = input.value.trim() === '' ? 'hidden' : 'visible';
                    placeHolder.style.visibility = input.value.trim() === '' ? 'visible' : 'hidden';
                });
            
                const starWrap = document.createElement('div');
                starWrap.className = 'star-wrap';

                wrapperDiv.append(input, placeHolder, label);
            
                if (index === 0 || index === 1) {
                    placeHolder.append(spanStar);
                    label.append(labelStar);
                }
            
                parent.append(wrapperDiv);
            
                return input;
            }
            
            const formContainer = document.createElement('div');
            formContainer.classList.add('form-container');

            const addedContactForms = [];

            const addContactButton = document.createElement('button');
            addContactButton.classList.add('addContact')
            formSelectBlock.append(formContainer, addContactButton);

            const IconAddContact = document.createElement('img');
            IconAddContact.classList.add('icon-contact');

            IconAddContact.setAttributeNS(null, 'width', '13');
            IconAddContact.setAttributeNS(null, 'height', '13');
            IconAddContact.setAttribute('src', `img/contact.png`);

            const spanTextContact = document.createElement('span');
            spanTextContact.textContent = "Добавить контакт";

            addContactButton.append(IconAddContact, spanTextContact);

            addContactButton.addEventListener('mouseenter', function () {
                IconAddContact.setAttribute('src', `img/contact-hover.png`);
            });
            
            addContactButton.addEventListener('mouseleave', function () {
                IconAddContact.setAttribute('src', `img/contact.png`);
            });

            const addChane = []; 
            const maxContactForms = 10; 

            addContactButton.addEventListener('click', async (event) => {
                event.preventDefault(); 

                if (addChane.length >= maxContactForms) {
                    alert('Достигнуто максимальное количество контактов (10).');
                    return;
                }

                const formContainerStyle = document.querySelector('.form-container');
                formContainerStyle.style.marginBottom = '25px'; 

                const selectBlockStyle = document.querySelector('.forn__select-block');
                selectBlockStyle.classList.add('forn__select-block_size');


                const addClientContact = document.createElement('form');
                addClientContact.id = 'addClientForm';
                addClientContact.classList.add('form-addContact');

                const contactTypeSelect = document.createElement('select');
                contactTypeSelect.classList.add('form__select');

                const errorDiv = document.querySelector('.error-div');

                const contactInput = document.createElement('input');
                contactInput.className = 'form__input-contact';

                errorDiv.style.visibility = 'visible';
            
                contactInput.addEventListener('input', () => {
                    errorDiv.style.visibility = contactInput.value.trim() === '' ? 'visible' : 'hidden';
                    contactInput.style.borderColor = contactInput.value.trim() === '' ? 'red' : '';
                });

                const closeButton = document.createElement('button');
                closeButton.classList.add('form__btn-close')

                const svgIconDel = document.createElement('img');
                svgIconDel.classList.add('icon-contact');
        
                svgIconDel.setAttributeNS(null, 'width', '11');
                svgIconDel.setAttributeNS(null, 'height', '11');
                svgIconDel.setAttribute('src', `img/close.png`);
        
                closeButton.append(svgIconDel);
        
                closeButton.addEventListener('mouseenter', function () {
                    svgIconDel.setAttribute('src', `img/close-hover.png`);
                });
                
                closeButton.addEventListener('mouseleave', function () {
                    svgIconDel.setAttribute('src', `img/close.png`);
                });            


                const contactOptions = {
                    'Телефон': 'phone',
                    'Доп. телефон': 'additionalPhone',
                    'VK': 'vk',
                    'Email': 'email',
                    'Twitter': 'twitter', 
                    'Facebook': 'facebook',
                    'Другое': 'other'
                };
                
                Object.entries(contactOptions).forEach(([displayText, value]) => {
                    const optionElement = document.createElement('option');
                    optionElement.classList.add('select__option');
                    optionElement.value = value;
                    optionElement.text = displayText;
                    contactTypeSelect.appendChild(optionElement);
                });

                contactInput.type = 'text';
                contactInput.placeholder = 'Введите контакт';

                addClientContact.appendChild(contactTypeSelect);

                const choices = new Choices(contactTypeSelect, {
                    searchEnabled: false,
                    placeholder: true,
                    placeholderValue: '',
                    shouldSort: false,
                    itemSelectText: '',
                    classNames: {
                        containerOuter: 'choices',
                    },
                });

                addClientContact.appendChild(contactInput);
                addClientContact.appendChild(closeButton);

                addedContactForms.push(addClientContact);

                formSelectBlock.appendChild(addClientContact);

                closeButton.addEventListener('click', () => {
                    const index = addedContactForms.indexOf(addClientContact);
                    if (index !== -1) {
                        addedContactForms.splice(index, 1);
                    }
            
                    formContainer.removeChild(addClientContact);
            
                    addClientContact.addEventListener('transitionend', () => {
                        formSelectBlock.removeChild(addClientContact);
                    });
            
                    addClientContact.style.opacity = '0';
                    addClientContact.style.height = '0';
                });

                formContainer.appendChild(addClientContact);
            });


            function checkAndToggleAddContactButton() {
                if (addChane.length >= maxContactForms) {
                    addContactButton.disabled = true; 
                } else {
                    addContactButton.disabled = false;  
                }
            }

            checkAndToggleAddContactButton();

            const errorBlock = document.createElement('div');
            errorBlock.className = 'error-div';

            const saveButton = document.createElement('button');
            saveButton.textContent = 'Сохранить';
            saveButton.classList.add('saveBtn');

            formBtnBlock.append(errorBlock, saveButton);

            inputs[0].addEventListener('input', clearError);
            inputs[1].addEventListener('input', clearError);

            saveButton.addEventListener('submit', addClientData);

            function clearError() {
                errorBlock.textContent = ''; 
            }

            function closeModal() {
                const modalContainer = document.querySelector('.modal-container');
                modalContainer.classList.remove('modal-container_active');
                const modalContent = document.querySelector('.modal');
                modalContent.innerHTML = '';
                contentTable.classList.remove('scroll-hidden');
            }
        
            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'Отмена';
            cancelButton.classList.add('cancelBtn');
        
            cancelButton.addEventListener('click', () => {
                closeModal(); 
            });
        
            const closeButton = document.createElement('button');
            closeButton.classList.add('modal__btn-close');
            formBtnBlock.append(cancelButton, closeButton);

            const svgIconClose = document.createElement('img');
            svgIconClose.classList.add('icon-contact');

            svgIconClose.setAttributeNS(null, 'width', '17');
            svgIconClose.setAttributeNS(null, 'height', '17');
            svgIconClose.setAttribute('src', `img/close.png`);


            closeButton.addEventListener('mouseenter', function () {
                svgIconClose.setAttribute('src', `img/close-hover.png`);
            });
            
            closeButton.addEventListener('mouseleave', function () {
                svgIconClose.setAttribute('src', `img/close.png`);
            });
        
            closeButton.append(svgIconClose);


            closeButton.addEventListener('click', () => {
                const modalContainer = document.querySelector('.modal-container');
                modalContainer.classList.remove('modal-container_active');
                const modalContent = document.querySelector('.modal');
                modalContent.innerHTML = '';
                contentTable.classList.remove('scroll-hidden');
            });

            openModal(addClientsForm);
        });
        
        const containerDiv = document.querySelector('.container');
        containerDiv.append(addButton);
    }
    

    function updateTable(clients) {
        const tableBody = document.getElementById('clientTableBody');
        tableBody.innerHTML = ''; 
    
        for (const client of clients) {
            const row = tableBody.insertRow();
            row.classList.add('clients__tr');
    
            const reqId = client.id;
            const idClient = String(parseInt(reqId, 10)).slice(0, 8);

            const fullName = `${capitalizeFirstLetter(client.surname)} ${capitalizeFirstLetter(client.name)} ${capitalizeFirstLetter(client.lastName)}`;

            function capitalizeFirstLetter(str) {
                if (str) {
                    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
                } else {
                    return '';
                }
            }
            const timeCreation = formatDateTime(client.createdAt);
            const lastChange = formatDateTime(client.updatedAt);
    
            const formSelectBlock = document.createElement('ul');
            formSelectBlock.classList.add('socials-block');

            const iconsToShow = 4;
            const allIcons = client.contacts.map(contact => {
            const iconSocial = document.createElement('li');
            const linkSocial = document.createElement('a');
            linkSocial.classList.add('icons', 'tooltip-container');

            const imgSocial = document.createElement('img');
            imgSocial.classList.add('icon-social'); 
            imgSocial.setAttribute('width', '16');
            imgSocial.setAttribute('height', '16');
            imgSocial.setAttribute('src', `img/socials/${contact.type}.png`);

            linkSocial.append(imgSocial);

            linkSocial.setAttribute('href', contact.link);
            linkSocial.setAttribute('data-tooltip-type', contact.type);
            linkSocial.setAttribute('data-tooltip-value', contact.value);

            iconSocial.append(linkSocial);
            return iconSocial;
            });

            allIcons.forEach(icon => {
                formSelectBlock.append(icon);
            });

            const socialsCell = row.insertCell();
            socialsCell.append(formSelectBlock);
        

            if (client.contacts.length > iconsToShow) {
                const shortIcons = client.contacts.slice(0, iconsToShow).map(contact => {
                    const iconSocial = document.createElement('li');
                    const linkSocial = document.createElement('a');
                    linkSocial.classList.add('icons', 'tooltip-container');
            
                    const imgSocial = document.createElement('img');
                    imgSocial.classList.add('icon-social'); 
                    imgSocial.setAttribute('width', '16');
                    imgSocial.setAttribute('height', '16');
                    imgSocial.setAttribute('src', `img/socials/${contact.type}.png`);
    
                    linkSocial.append(imgSocial);
    
                    linkSocial.setAttribute('href', contact.link);
                    linkSocial.setAttribute('data-tooltip-type', contact.type);
                    linkSocial.setAttribute('data-tooltip-value', contact.value);
       
                    iconSocial.append(linkSocial);
                    return iconSocial;
                });
            
                const betweenIcons = client.contacts.length - iconsToShow;
            
                const showMoreButton = document.createElement('button');
                showMoreButton.classList.add('btn-addIcons');
                showMoreButton.textContent = `+${betweenIcons}`;
                showMoreButton.addEventListener('click', function () {
                    formSelectBlock.innerHTML = allIcons.map(icon => icon.outerHTML).join('');
                    addTooltipEventListeners(formSelectBlock);
                });
            
                formSelectBlock.innerHTML = shortIcons.map(icon => icon.outerHTML).join('');
                addTooltipEventListeners(formSelectBlock);
            
                formSelectBlock.append(showMoreButton);
            } else {
                formSelectBlock.innerHTML = allIcons.map(icon => icon.outerHTML).join('');
                addTooltipEventListeners(formSelectBlock);
            }
    
            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);
            const cell3 = row.insertCell(2);
            const cell4 = row.insertCell(3);
            const cell5 = row.insertCell(4);
            const cell6 = row.insertCell(5);
            // const cell7 = row.insertCell(6);
    
            cell1.classList.add('clients__td', 'clients__td-id');
            cell2.classList.add('clients__td');
            cell3.classList.add('clients__td');
            cell4.classList.add('clients__td');
            cell5.classList.add('clients__td');
            cell6.classList.add('clients__td', 'clients__td-flex');
            // cell7.classList.add('clients__td');
    
            cell1.innerHTML = idClient;
            cell2.innerHTML = fullName;
            cell3.innerHTML = '';
            cell4.innerHTML = '';
    
            timeCreation.forEach(element => {
                cell3.append(element);
            });
    
            lastChange.forEach(element => {
                cell4.append(element);
            });
    
            cell5.append(formSelectBlock);
    
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('deleteBtn');
            
            const IconDel = document.createElement('img');
            IconDel.classList.add('icon-deleteBtn');

            IconDel.setAttributeNS(null, 'width', '12');
            IconDel.setAttributeNS(null, 'height', '12');
            IconDel.setAttribute('src', `img/del.png`);

            const spanTextDel = document.createElement('span');
            spanTextDel.textContent = "Удалить";

            deleteBtn.append(IconDel, spanTextDel);

            deleteBtn.setAttribute('data-client-id', client.id);
            
            deleteBtn.addEventListener('click', async () => {
                deleteImgActive()
                const modalContainer = document.querySelector('.modal-container');
                modalContainer.classList.add('modal-container_active');

                const confirmationModal = createConfirmationModal();
                modalContainer.append(confirmationModal);

                let animStop = document.querySelector('.btn-spin');
                animStop.classList.add('btn-spin_stop');
            
                const confirmDeleteBtn = confirmationModal.querySelector('#confirmDeleteBtn');
            
                confirmDeleteBtn.addEventListener('click', async () => {
                    
                    const clientId = deleteBtn.getAttribute('data-client-id');
                
                    try {
                        const response = await fetch(`${API_URL}/${clientId}`, {
                            method: 'DELETE',
                        });
                
                        if (response.ok) {
                            const rowToRemove = deleteBtn.parentElement.parentElement;
                            if (rowToRemove) {
                                rowToRemove.remove();
                            }
                        } else {
                            console.error('Failed to delete client.');
                        }
                    } catch (error) {
                        console.error('Error sending delete request:', error);
                    }
                
                    closeModal();
                });
            });

            cell6.append(deleteBtn);//777

            function deleteImgActive() {
                const svgIconDel = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
                svgIconDel.classList.add('btn-spin');
            
                svgIconDel.setAttributeNS(null, 'width', '12');
                svgIconDel.setAttributeNS(null, 'height', '12');
                svgIconDel.setAttributeNS(null, 'viewBox', '0 0 12 12');
            
                const useElementDel = document.createElementNS("http://www.w3.org/2000/svg", 'use');
                useElementDel.setAttribute('href', `sprite-btn.svg#delete-spin`);
            
                svgIconDel.append(useElementDel);
            
                const spanTextEdit = document.createElement('span');
                spanTextEdit.textContent = "Удалить";
            
                deleteBtn.innerHTML = '';
                deleteBtn.append(svgIconDel, spanTextEdit);
            }


            const changeBtn = document.createElement('button');
            changeBtn.classList.add('changeBtn');

            const IconEdit = document.createElement('img');
            IconEdit.classList.add('icon-changeBtn');

            IconEdit.setAttributeNS(null, 'width', '12');
            IconEdit.setAttributeNS(null, 'height', '12');
            IconEdit.setAttribute('src', `img/edit.png`);

            const spanTextEdit = document.createElement('span');
            spanTextEdit.textContent = "Изменить";

            changeBtn.append(IconEdit, spanTextEdit);

            changeBtn.setAttribute('data-client-id', client.id);

            changeBtn.addEventListener('click', async () => {
                changeImgActive();
                const clientId = changeBtn.getAttribute('data-client-id');
                const clientData = await getClientDataById(clientId);

                openEditModal(clientData, spanTextEdit);

                let animStop = document.querySelector('.btn-spin');
                animStop.classList.add('btn-spin_stop');
            });

            cell6.append(changeBtn);

            function changeImgActive() {
                const IconEdit = document.createElement('img');
                IconEdit.classList.add('btn-spin');
            
                IconEdit.setAttribute(null, 'width', '12');
                IconEdit.setAttribute(null, 'height', '12');
                IconEdit.setAttribute('src', `img/spin.png`);
            
                const spanTextEdit = document.createElement('span');
                spanTextEdit.textContent = "Изменить";
            
                changeBtn.innerHTML = '';
                changeBtn.append(IconEdit, spanTextEdit);
            }
        }
    }


    function closeModal() {
        const modalContainer = document.querySelector('.modal-container');
        modalContainer.classList.remove('modal-container_active');
        const modalContent = document.querySelector('.modal');
        modalContent.innerHTML = '';
        contentTable.classList.remove('scroll-hidden');
    }


    function openModal(content) {
        const modalContainer = document.querySelector('.modal-container'); 
        modalContainer.classList.add('modal-container_active');

        const modalContent = document.getElementById('modalContent');
        modalContent.append(content);
    
        contentTable.classList.add('scroll-hidden');
    }


    function showLoadingIndicator(minimumDisplayTime = 10000) {
        const loadingIndicator = document.getElementById('loadingIndicator');
        loadingIndicator.style.display = 'flex';
    
        setTimeout(() => {
            hideLoadingIndicator();
        }, minimumDisplayTime);
    }


    function hideLoadingIndicator() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        loadingIndicator.style.display = 'none';
    }


    function formatDateTime(dateTimeString) {
        const dateTime = new Date(dateTimeString);
    
        const date = dateTime.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.');
    
        const dateElement = document.createElement('span');
        dateElement.textContent = date;
        dateElement.classList.add('date-style');
    
        const time = dateTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    
        const timeElement = document.createElement('span');
        timeElement.textContent = time;
        timeElement.classList.add('time-style');
    
        const formattedDateTime = [dateElement, timeElement];
    
        return formattedDateTime;
    }


    async function searchClients(query) {
        try {
            const response = await fetch(`${API_URL}?search=${query}`);
            if (response.ok) {
                const clients = await response.json();
                updateTable(clients);
            } else {
                console.error('Ошибка при запросе клиентов:', response.status);
            }
        } catch (error) {
            console.error('Произошла ошибка при запросе клиентов:', error);
        }
    }


    searchInput.addEventListener('input', function () {
        clearTimeout(debounceTimer);

        debounceTimer = setTimeout(function () {
            const searchQuery = searchInput.value.trim();
            searchClients(searchQuery);
        }, 300);
    });


    async function getClientList(params) {
        try {
            let apiUrl = API_URL;
            if (params && params.search) {
                apiUrl += `?search=${encodeURIComponent(params.search)}`;
            }

            const response = await fetch(apiUrl);

            if (response.status === 200) {
                const clients = await response.json();
                return clients;
            } else {
                console.error('Ошибка при получении списка студентов');
                return [];
            }
        } catch (error) {
            console.error('Произошла ошибка при отправке запроса на сервер:', error);
            return [];
        }
    }


    function sortTable(columnIndex) {
        if (currentSortColumn === columnIndex) {
            isAscending = !isAscending;
        } else {
            isAscending = true;
            currentSortColumn = columnIndex;
        }
    
        resetArrows();
    
        updateArrow(currentSortColumn, isAscending);
    
        const table = document.getElementById('clientTableBody');
        const rows = Array.from(table.rows);
    
        const isNumeric = !isNaN(parseFloat(rows[1].cells[columnIndex].innerText));
    
        rows.sort((a, b) => {
            const aValue = isNumeric ? parseFloat(a.cells[columnIndex].innerText) : a.cells[columnIndex].innerText;
            const bValue = isNumeric ? parseFloat(b.cells[columnIndex].innerText) : b.cells[columnIndex].innerText;
    
            if (isAscending) {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    
        table.innerHTML = '';
        rows.forEach(row => table.append(row));
    }
    

    function resetArrows() {
        for (let i = 0; i < 4; i++) {
            updateArrow(i, false);
        }
    }
    

    function updateArrow(column, ascending) {
        const arrowIcon = document.getElementById(`arrow-icon-${column}`);
        const az = document.querySelector('.client_AZ');
    
        if (arrowIcon && az) {
            arrowIcon.classList.toggle('arrow-icon-up', ascending);
            arrowIcon.classList.toggle('arrow-icon-down', !ascending);
    
            const reversedAz = az.textContent.split('').reverse().join('');
            
            az.textContent = reversedAz;
        }
    }
    
        
    headingTables.forEach(headingTable => {
        headingTable.addEventListener('click', () => {
            const isActive = headingTable.classList.contains('clients__text_active');
    
            headingTables.forEach(table => {
                table.classList.remove('clients__text_active');
            });
    
            if (!isActive) {
                headingTable.classList.add('clients__text_active');
                updateArrow('your_column_name', true); 
            } else {
                updateArrow('your_column_name', false); 
            }
        });
    });
    

    sortableHeaders.forEach((header, index) => {
        header.addEventListener('click', () => sortTable(index));
    });
    
    
    async function getClientDataById(clientId) {
        try {
            const response = await fetch(`${API_URL}/${clientId}`);
            if (response.status === 200) {
                const clientData = await response.json();
                return clientData;
            } else {
                console.error('Ошибка при получении данных клиента');
                return null;
            }
        } catch (error) {
            console.error('Произошла ошибка при отправке запроса на сервер:', error);
            return null;
        }
    }    


    function createContactForm(contactOptions, contactData = {}) {
        const contactForm = document.createElement('form');
        contactForm.classList.add('form-addContact');
    
        const contactTypeSelect = document.createElement('select');
        contactTypeSelect.classList.add('form__select');
    
        const contactInput = document.createElement('input');
        contactInput.classList.add('form__input-contact');

        const errorDiv = document.querySelector('.error-div');

        contactInput.style.visibility = 'visible';
    
        contactInput.addEventListener('input', () => {
            errorDiv.style.visibility = contactInput.value.trim() === '' ? 'visible' : 'hidden';
            contactInput.style.borderColor = contactInput.value.trim() === '' ? 'red' : '';
        });

        const closeButton = document.createElement('button');
        closeButton.classList.add('form__btn-close');

        const svgIconDel = document.createElement('img');
        svgIconDel.classList.add('icon-contact');

        svgIconDel.setAttributeNS(null, 'width', '11');
        svgIconDel.setAttributeNS(null, 'height', '11');
        svgIconDel.setAttribute('src', `img/close.png`);

        closeButton.append(svgIconDel);

        closeButton.addEventListener('mouseenter', function () {
            svgIconDel.setAttribute('src', `img/close-hover.png`);
        });
        
        closeButton.addEventListener('mouseleave', function () {
            svgIconDel.setAttribute('src', `img/close.png`);
        });
    
        closeButton.append(svgIconDel);
    
        Object.entries(contactOptions).forEach(([displayText, value]) => {
            const optionElement = document.createElement('option');
            optionElement.classList.add('select__option');
            optionElement.value = value;
            optionElement.text = displayText;
            contactTypeSelect.append(optionElement);
        });
    
        contactForm.append(contactTypeSelect, contactInput, closeButton);
    
        contactTypeSelect.value = contactData.type || '';
        contactInput.value = contactData.value || '';
    
        document.body.append(contactForm);
    
        const choices = new Choices(contactTypeSelect, {
            searchEnabled: false,
            shouldSort: false,
            itemSelectText: '',
            classNames: {
                containerOuter: 'choices',
            },
        });
    
        closeButton.addEventListener('click', () => {
            if (document.body.contains(contactForm)) {
                contactForm.remove();
            }
        });
    
        return contactForm;
    }
    

    function addTooltipEventListeners(parentElement) {
        const tooltipContainers = parentElement.querySelectorAll('.tooltip-container');
    
        tooltipContainers.forEach(container => {
            const tooltipType = container.dataset.tooltipType;
            const tooltipValue = container.dataset.tooltipValue;
    
            const tooltipElement = document.createElement('div');
            tooltipElement.className = 'tooltip';
            tooltipElement.innerHTML = `<span class="tooltip-name">${tooltipType}: </span><span class="tooltip-value">${tooltipValue}</span>`;
            
            container.append(tooltipElement);
        });
    }
    

    window.addEventListener('load', () => {
        loadTable();
    });
    
});

