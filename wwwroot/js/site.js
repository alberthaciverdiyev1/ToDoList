$(document).ready(function () {
    let filesArray = [];

    function formatDate(date) {
        const now = new Date();
        const inputDate = new Date(date);
        const difference = now - inputDate; // difference in milliseconds

        if (difference < 0) {
            return "Future date";
        }

        const seconds = Math.floor(difference / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);

        if (seconds >= 60) {
            if (minutes < 60) {
                return `${minutes} minutes ago`;
            } else if (hours < 24) {
                return `${hours} hours ago`;
            } else if (days < 30) {
                return `${days} days ago`;
            } else {
                // More than a month ago, show the full date
                return inputDate.toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                });
            }
        } else {
            // No display for 1 second; only displays for more than 1 second
            return `${seconds} seconds ago`;
        }
    }


    const getAll = () => {
        let h = "";
        $.get({
            url: '/Home/GetAll',
            method: 'GET',
            success: function (data) {
                filesArray = data;
                data.forEach((fileData, i) => {
                    console.log(fileData)
                    const mimeType = fileData.type;
                    const base64Data = fileData.document;
                    const fileUrl = `data:${mimeType};base64,${base64Data}`;

                    h += `
                        <tr class="hover:bg-blue-50 transition duration-200 border-b border-gray-200"  data-id="${fileData.id}">
                            <td class="px-4 py-3 text-gray-700">${i + 1} </td>
                            <td class="px-4 py-3 text-gray-700">${fileData.name}</td>
                            <td class="px-4 py-3 text-gray-700">${fileData.description}</td >
                            <td class="px-4 py-3 text-gray-700">  ${formatDate(fileData.lastModified ?? fileData.createdAt)} </td>
                            <td class="px-4 py-3 text-center">
                                <div class="flex justify-center space-x-2">
                                    <button id="viewFileButton" data-id="${fileData.id}" class="bg-blue-500 text-white py-1 px-3 rounded-lg hover:bg-blue-600 transition duration-200">
                                        <i class="fas fa-eye"></i>
                                    </button> 
                                    <button id="editButton" data-id="${fileData.id}" class="bg-yellow-500 text-white py-1 px-3 rounded-lg hover:bg-yellow-600 transition duration-200">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button id="view-as-pdf" data-id="${fileData.id}" class="bg-orange-500 text-white py-1 px-3 rounded-lg hover:bg-orange-600 transition duration-200">
                                        <i class="fa-solid fa-file-pdf"></i>
                                    </button>
                                    <button data-role="delete" data-id="${fileData.id}" class="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600 transition duration-200">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>

                    `
                });
                $('#tableBody').html(h);
            },
            error: function (e) {
                console.error("Dosyalar alınırken bir hata oluştu:", e);
            }
        });
    };

    getAll();
    $(document).on("click", "#viewFileButton", function () {
        let id = $(this).data("id");
        let file = filesArray.find(x => x.id === id);

        if (file) {
            const byteCharacters = atob(file.document);
            const byteArray = new Uint8Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteArray[i] = byteCharacters.charCodeAt(i);
            }

            const blob = new Blob([byteArray], { type: file.type });
            const url = URL.createObjectURL(blob);

            window.open(url, '_blank');
        } else {
            console.error("File not found!");
        }
    });


    $(document).on("click", "#view-as-pdf", function () {
        let id = $(this).data("id");
        let file = filesArray.find(x => x.id === id);

        if (file) {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();

            pdf.setFontSize(12);
            pdf.text(`Name: ${file.name}`, 10, 10);
            pdf.text(`Description: ${file.description}`, 10, 20);
            pdf.text(`Date: ${file.updatedAt ?? file.createdAt}`, 10, 30);

            let contentY = 40;

            const mimeType = file.type;
            const base64Data = file.document;
            const byteCharacters = atob(base64Data);
            const byteArray = new Uint8Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteArray[i] = byteCharacters.charCodeAt(i);
            }

            const blob = new Blob([byteArray], { type: mimeType });
            const url = URL.createObjectURL(blob);

            if (mimeType.startsWith('image/')) {
                pdf.addImage(url, mimeType.split('/')[1], 10, contentY, 180, 160);
            } else if (mimeType.startsWith('text/') || mimeType === 'application/json') {
                const textContent = byteCharacters;
                pdf.text(textContent, 10, contentY);
            } else if (mimeType === 'application/pdf') {
                pdf.text('The content is another PDF, which cannot be embedded directly.', 10, contentY);
            } else {
                pdf.text('File content cannot be previewed.', 10, contentY);
            }

            pdf.output('dataurlnewwindow');
        } else {
            console.error("File not found!");
        }
    });


    const $modal = $('#modal');
    const $modalTitle = $('#modalTitle');
    const $nameInput = $('#name');
    const $descriptionInput = $('#description');
    const $fileInput = $('#file');
    const $saveButton = $('#saveButton');
    const $updateButton = $('#updateButton');

    // Open Modal Function
    function openModal(id, data = null) {
        $modalTitle.text(mode === 'add' ? 'Add File' : 'Edit File');
        if (mode === 'edit' && data) {
            $nameInput.val(data.name);
            $descriptionInput.val(data.description);

            $saveButton.addClass('hidden');
            $updateButton.removeClass('hidden');
        } else {
            $nameInput.val('');
            $descriptionInput.val('');
            $fileInput.val(null);

            $saveButton.removeClass('hidden');
            $updateButton.addClass('hidden');
        }
        $modal.removeClass('hidden');
    }

    function closeModal(id = null) {
        $('#addFileModal').addClass('hidden');
        $('#editFileModal').addClass('hidden');
        $('#filePreview').addClass('hidden');
        $('#editFilePreview').addClass('hidden');
    }

    $('#saveButton').on('click', function () {

        const name = $('#name').val();
        const description = $('#description').val();
        const fileInput = $('#file')[0].files[0];


        $('#description').siblings('p').addClass('hidden');
        $('#name').siblings('p').addClass('hidden');
        $('#file').siblings('p').addClass('hidden');

        if (!description) {
            $('#description').siblings('p').removeClass('hidden');
        }

        if (!name) {
            $('#name').siblings('p').removeClass('hidden');
        }

        if (!fileInput) {
            $('#file').siblings('p').removeClass('hidden');
        }

        if (!description || !name || !fileInput) return;

        const formData = new FormData();
        formData.append('Name', name);
        formData.append('Description', description);
        formData.append('File', fileInput);

        const token = $('input[name="__RequestVerificationToken"]').val();
        formData.append('__RequestVerificationToken', token);

        $.ajax({
            url: '/Home/Create',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                Swal.fire({
                    icon: "success",
                    text: response,
                });
                getAll();
                closeModal();
                $('#name').val("");
                $('#description').val("");
                $('#file').val("");
            },
            error: function (error) {
                console.error('Error uploading file:', error);
                alert('File upload failed.');
            }
        });
    });


    $('#file').on('change', function () {
        const file = this.files[0];

        if (file) {
            const fileType = file.type;

            // Create a FileReader to read the file
            const reader = new FileReader();

            reader.onload = function (e) {
                const fileUrl = e.target.result;

                let previewContent = '';

                // Check the file type and display appropriate preview
                if (fileType.startsWith('image/')) {
                    previewContent = `<img src="${fileUrl}" alt="File Preview" style="max-width: 45%; height: auto;">`;
                } else if (fileType.startsWith('audio/')) {
                    previewContent = `<audio controls><source src="${fileUrl}" type="${fileType}">Your browser does not support the audio element.</audio>`;
                } else if (fileType === 'application/pdf') {
                    previewContent = `<iframe src="${fileUrl}" width="45%" height="auto"></iframe>`;
                } else {
                    previewContent = `<p>This file cannot be previewed.</p>`;
                }

                // Update the preview section and show it
                $('#filePreview').html(previewContent).removeClass('hidden');
                $('#editFilePreview').html("").removeClass('hidden');
                $('#editFilePreview').html(previewContent).removeClass('hidden');

            };

            // Read the file as a data URL
            reader.readAsDataURL(file);
        }
    });

    $(document).on("click", `[data-role="delete"]`, function () {
        let id = $(this).data("id");
        Swal.fire({
            title: "Do you want to delete?",
            showCancelButton: true,
            confirmButtonText: "Delete",
            confirmButtonColor: "#dc3545",
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: `/Home/Delete/${id}`,
                    type: 'POST',
                    success: function (response) {
                        Swal.fire({
                            icon: "success",
                            text: response,
                        });
                        getAll();
                    },
                    error: function (error) {
                        console.error('Error deleting file:', error);
                    }
                });
            }
        });
    });

    $(document).on("click", `[data-role="delete-permanatly"]`, function () {
        let id = $(this).data("id");
        Swal.fire({
            title: "Do you want to delete?",
            showCancelButton: true,
            confirmButtonText: "Delete",
            confirmButtonColor: "#dc3545",
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: `/Home/HardDelete/${id}`,
                    type: 'POST',
                    success: function (response) {
                        Swal.fire({
                            icon: "success",
                            text: response,
                        });
                        GetTrashList();
                    },
                    error: function (error) {
                        console.error('Error deleting file:', error);
                    }
                });
            }
        });
    });

    $updateButton.on('click', function () {
        const formData = {
            name: $nameInput.val(),
            description: $descriptionInput.val(),
            file: $fileInput[0].files[0] || null,
        };

        console.log('Collected Data:', formData);
        closeModal($('#editButton'));
    });

    // Cancel Button Click Event
    $('#cancelButton').on('click', closeModal);
    $('#cancelEditButton').on('click', closeModal);


    // Trigger Modal Open for Add and Edit
    $('#newButton').on('click', function () {
        $(`#addFileModal`).removeClass("hidden")
    });

    $(document).on('click', '#editButton', function () {
        const $editModal = $('#editFileModal');
        $editModal.removeClass('hidden');


        let id = $(this).data('id');
        $('#saveEditButton').attr('data-id', id);


        let file = filesArray.find(x => x.id === id);

        if (file) {
            // Dosya tipini ve belgesini doğrula
            const fileType = file.type;
            const byteCharacters = atob(file.document); // Base64'ten çöz
            const byteArray = new Uint8Array(byteCharacters.length);

            for (let i = 0; i < byteCharacters.length; i++) {
                byteArray[i] = byteCharacters.charCodeAt(i);
            }

            const blob = new Blob([byteArray], { type: fileType });
            const fileUrl = URL.createObjectURL(blob);

            let previewContent = '';

            if (fileType.startsWith('image/')) {
                previewContent = `<img src="${fileUrl}" alt="File Preview" style="max-width: 100%; height: auto;">`;
            } else if (fileType.startsWith('audio/')) {
                previewContent = `<audio controls><source src="${fileUrl}" type="${fileType}">Your browser does not support the audio element.</audio>`;
            } else if (fileType === 'application/pdf') {
                previewContent = `<iframe src="${fileUrl}" width="100%" height="500px"></iframe>`;
            } else {
                previewContent = `<p>This file type is not supported for preview.</p>`;
            }

            $('#editFilePreview').html(previewContent).removeClass('hidden');
        } else {
            Swal.fire({
                icon: 'error',
                title: 'File Not Found',
                text: 'The selected file could not be found.',
            });
            return;
        }

        // Form alanlarını dosya bilgileriyle doldur
        $('#editName').val(file.name);
        $('#editDescription').val(file.description);
    });


    const GetTrashList = () => {
        let h = "";
        $.get({
            url: '/Home/GetTrashedList',
            method: 'GET',
            success: function (data) {
                filesArray = data;
                data.forEach((fileData, i) => {
                    console.log(fileData)
                    const mimeType = fileData.type;
                    const base64Data = fileData.document;
                    const fileUrl = `data:${mimeType};base64,${base64Data}`;

                    h += `
                        <tr class="hover:bg-blue-50 transition duration-200 border-b border-gray-200"  data-id="${fileData.id}">
                            <td class="px-4 py-3 text-gray-700">${i + 1} </td>
                            <td class="px-4 py-3 text-gray-700">${fileData.name}</td>
                            <td class="px-4 py-3 text-gray-700">${fileData.description}</td >
                            <td class="px-4 py-3 text-gray-700">  ${formatDate(fileData.lastModified ?? fileData.createdAt)} </td>
                            <td class="px-4 py-3 text-center">
                                <div class="flex justify-center space-x-2">
                                    <button id="viewFileButton" data-id="${fileData.id}" class="bg-blue-500 text-white py-1 px-3 rounded-lg hover:bg-blue-600 transition duration-200">
                                        <i class="fas fa-eye"></i>
                                    </button> 
                                    <button id="editButton" data-id="${fileData.id}" class="bg-yellow-500 text-white py-1 px-3 rounded-lg hover:bg-yellow-600 transition duration-200">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button id="view-as-pdf" data-id="${fileData.id}" class="bg-orange-500 text-white py-1 px-3 rounded-lg hover:bg-orange-600 transition duration-200">
                                        <i class="fa-solid fa-file-pdf"></i>
                                    </button>
                                    <button data-role="delete-permanatly" data-id="${fileData.id}" class="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600 transition duration-200">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>

                    `
                });
                $('#tableBody').html(h);
            },
            error: function (e) {
                console.error("Dosyalar alınırken bir hata oluştu:", e);
            }
        });
    };


    $(document).on('click', `#saveEditButton`, () => {
        //let id = $(this).data('id');
        let id = $('#saveEditButton').data("id");
        console.log({ id });

        const name = $('#editName').val();
        const description = $('#editDescription').val();
        const fileInput = $('#editFile')[0].files[0]; // Eğer kullanıcı dosya yüklediyse

        $('#editName').siblings('p').addClass('hidden');
        $('#editDescription').siblings('p').addClass('hidden');
        $('#editFile').siblings('p').addClass('hidden');

        if (!name) {
            $('#editName').siblings('p').removeClass('hidden');
        }
        if (!description) {
            $('#editDescription').siblings('p').removeClass('hidden');
        }

        if (!name || !description) return;
        console.log(id)
        const formData = new FormData();
        formData.append('Id', id); // id'yi formData'ya ekle
        formData.append('Name', name);
        formData.append('Description', description);
        if (fileInput) {
            formData.append('File', fileInput);
        }

        $.ajax({
            url: '/Home/Update',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                Swal.fire({
                    icon: "success",
                    text: response,
                });
                getAll(); // Listeyi yenile
                closeModal(); // Modal'ı kapat
                $('#editName').val(""); // Giriş alanlarını temizle
                $('#editDescription').val("");
                $('#editFile').val("");
            },
            error: function (error) {
                console.error('Error updating file:', error);
                alert('File update failed.');
            }
        });
    });

    $(document).on('click', `#trashBox`, () => {
        GetTrashList();
        $(`#getAllButton`).removeClass("hidden")
        $(`#trashBox`).addClass("hidden");
        
    })
    $(document).on('click', `#getAllButton`, () => {
        getAll()
        $(`#getAllButton`).addClass("hidden")
        $(`#trashBox`).removeClass("hidden")

    })

    /*==================================*/

    $(document).on("click", `#allFiles`, () => {
        $('#onlyDocs').removeClass(' bg-blue-100 text-blue-500');
        $('#onlyPdf').removeClass(' bg-blue-100 text-blue-500');
        $('#onlOthers').removeClass(' bg-blue-100 text-blue-500');
        $('#onlyImages').removeClass(' bg-blue-100 text-blue-500');
        $('#onlyMusics').removeClass(' bg-blue-100 text-blue-500');

        $('#allFiles').addClass(' bg-blue-100 text-blue-500')
        getAll()
    });


    $(document).on("click", `#onlyPdf`, () => {
        $('#onlyDocs').removeClass(' bg-blue-100 text-blue-500');
        $('#onlyOthers').removeClass(' bg-blue-100 text-blue-500');
        $('#allFiles').removeClass(' bg-blue-100 text-blue-500');
        $('#onlyImages').removeClass(' bg-blue-100 text-blue-500');
        $('#onlyMusics').removeClass(' bg-blue-100 text-blue-500');

        $('#onlyPdf').addClass(' bg-blue-100 text-blue-500')
        let pdfFiles = filesArray.filter(x => x.type === 'application/pdf');
        let h = '';

        pdfFiles.forEach((fileData, i) => {
            const mimeType = fileData.type;
            const base64Data = fileData.document;
            const fileUrl = `data:${mimeType};base64,${base64Data}`;

            h += `
            <tr class="hover:bg-blue-50 transition duration-200 border-b border-gray-200" data-id="${fileData.id}">
                <td class="px-4 py-3 text-gray-700">${i + 1}</td>
                <td class="px-4 py-3 text-gray-700">${fileData.name}</td>
                <td class="px-4 py-3 text-gray-700">${fileData.description}</td>
                <td class="px-4 py-3 text-gray-700">${formatDate(fileData.lastModified ?? fileData.createdAt)}</td>
                <td class="px-4 py-3 text-center">
                    <div class="flex justify-center space-x-2">
                        <button id="viewFileButton" data-id="${fileData.id}" class="bg-blue-500 text-white py-1 px-3 rounded-lg hover:bg-blue-600 transition duration-200">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button id="editButton" data-id="${fileData.id}" class="bg-yellow-500 text-white py-1 px-3 rounded-lg hover:bg-yellow-600 transition duration-200">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button id="view-as-pdf" data-id="${fileData.id}" class="bg-orange-500 text-white py-1 px-3 rounded-lg hover:bg-orange-600 transition duration-200">
                            <i class="fa-solid fa-file-pdf"></i>
                        </button>
                        <button data-role="delete" data-id="${fileData.id}" class="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600 transition duration-200">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        });

        // Update the table body with the generated rows
        $('#tableBody').html(h);
    });



    $(document).on("click", `#onlyImages`, () => {

        $('#onlyDocs').removeClass(' bg-blue-100 text-blue-500');
        $('#onlyPdf').removeClass(' bg-blue-100 text-blue-500');
        $('#allFiles').removeClass(' bg-blue-100 text-blue-500');
        $('#onlyMusics').removeClass(' bg-blue-100 text-blue-500');
        $('#onlyOthers').removeClass(' bg-blue-100 text-blue-500');

        $('#onlyImages').addClass(' bg-blue-100 text-blue-500')
        let imageFiles = filesArray.filter(file => file.type.startsWith('image/'));
        let h = '';

        imageFiles.forEach((fileData, i) => {
            const mimeType = fileData.type;
            const base64Data = fileData.document;
            const fileUrl = `data:${mimeType};base64,${base64Data}`;

            h += `
            <tr class="hover:bg-blue-50 transition duration-200 border-b border-gray-200" data-id="${fileData.id}">
                <td class="px-4 py-3 text-gray-700">${i + 1}</td>
                <td class="px-4 py-3 text-gray-700">${fileData.name}</td>
                <td class="px-4 py-3 text-gray-700">${fileData.description}</td>
                <td class="px-4 py-3 text-gray-700">${formatDate(fileData.lastModified ?? fileData.createdAt)}</td>
                <td class="px-4 py-3 text-center">
                    <div class="flex justify-center space-x-2">
                        <button id="viewFileButton" data-id="${fileData.id}" class="bg-blue-500 text-white py-1 px-3 rounded-lg hover:bg-blue-600 transition duration-200">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button id="editButton" data-id="${fileData.id}" class="bg-yellow-500 text-white py-1 px-3 rounded-lg hover:bg-yellow-600 transition duration-200">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button id="view-as-pdf" data-id="${fileData.id}" class="bg-orange-500 text-white py-1 px-3 rounded-lg hover:bg-orange-600 transition duration-200">
                            <i class="fa-solid fa-file-pdf"></i>
                        </button>
                        <button data-role="delete" data-id="${fileData.id}" class="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600 transition duration-200">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        });

        // Update the table body with the generated rows
        $('#tableBody').html(h);
    });


    $(document).on("click", `#onlyMusics`, () => {
        $('#onlyDocs').removeClass(' bg-blue-100 text-blue-500');
        $('#onlyPdf').removeClass(' bg-blue-100 text-blue-500');
        $('#allFiles').removeClass(' bg-blue-100 text-blue-500');
        $('#onlyImages').removeClass(' bg-blue-100 text-blue-500');
        $('#onlyOthers').removeClass(' bg-blue-100 text-blue-500');

        $('#onlyMusics').addClass(' bg-blue-100 text-blue-500')

        let imageFiles = filesArray.filter(file => file.type.startsWith('audio/'));
        let h = '';

        imageFiles.forEach((fileData, i) => {
            const mimeType = fileData.type;
            const base64Data = fileData.document;
            const fileUrl = `data:${mimeType};base64,${base64Data}`;

            h += `
            <tr class="hover:bg-blue-50 transition duration-200 border-b border-gray-200" data-id="${fileData.id}">
                <td class="px-4 py-3 text-gray-700">${i + 1}</td>
                <td class="px-4 py-3 text-gray-700">${fileData.name}</td>
                <td class="px-4 py-3 text-gray-700">${fileData.description}</td>
                <td class="px-4 py-3 text-gray-700">${formatDate(fileData.lastModified ?? fileData.createdAt)}</td>
                <td class="px-4 py-3 text-center">
                    <div class="flex justify-center space-x-2">
                        <button id="viewFileButton" data-id="${fileData.id}" class="bg-blue-500 text-white py-1 px-3 rounded-lg hover:bg-blue-600 transition duration-200">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button id="editButton" data-id="${fileData.id}" class="bg-yellow-500 text-white py-1 px-3 rounded-lg hover:bg-yellow-600 transition duration-200">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button id="view-as-pdf" data-id="${fileData.id}" class="bg-orange-500 text-white py-1 px-3 rounded-lg hover:bg-orange-600 transition duration-200">
                            <i class="fa-solid fa-file-pdf"></i>
                        </button>
                        <button data-role="delete" data-id="${fileData.id}" class="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600 transition duration-200">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        });

        // Update the table body with the generated rows
        $('#tableBody').html(h);
    });


    $(document).on("click", `#onlyDocs`, () => {
        $('#onlyMusics').removeClass(' bg-blue-100 text-blue-500');
        $('#onlyPdf').removeClass(' bg-blue-100 text-blue-500');
        $('#allFiles').removeClass(' bg-blue-100 text-blue-500');
        $('#onlyImages').removeClass(' bg-blue-100 text-blue-500');
        $('#onlyOthers').removeClass(' bg-blue-100 text-blue-500');

        $('#onlyDocs').addClass(' bg-blue-100 text-blue-500')
        const documentTypes = [
            'application/msword', // .doc
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
            'application/vnd.ms-excel', // .xls
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-powerpoint', // .ppt
            'application/vnd.openxmlformats-officedocument.presentationml.presentation' // .pptx
        ];

        let docFiles = filesArray.filter(file => documentTypes.includes(file.type));
        let h = '';

        docFiles.forEach((fileData, i) => {
            const mimeType = fileData.type;
            const base64Data = fileData.document;
            const fileUrl = `data:${mimeType};base64,${base64Data}`;

            h += `
            <tr class="hover:bg-blue-50 transition duration-200 border-b border-gray-200" data-id="${fileData.id}">
                <td class="px-4 py-3 text-gray-700">${i + 1}</td>
                <td class="px-4 py-3 text-gray-700">${fileData.name}</td>
                <td class="px-4 py-3 text-gray-700">${fileData.description}</td>
                <td class="px-4 py-3 text-gray-700">${formatDate(fileData.createdAt)}</td>
                <td class="px-4 py-3 text-center">
                    <div class="flex justify-center space-x-2">
                        <button id="viewFileButton" data-id="${fileData.id}" class="bg-blue-500 text-white py-1 px-3 rounded-lg hover:bg-blue-600 transition duration-200">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button id="editButton" data-id="${fileData.id}" class="bg-yellow-500 text-white py-1 px-3 rounded-lg hover:bg-yellow-600 transition duration-200">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button id="view-as-pdf" data-id="${fileData.id}" class="bg-orange-500 text-white py-1 px-3 rounded-lg hover:bg-orange-600 transition duration-200">
                            <i class="fa-solid fa-file-pdf"></i>
                        </button>
                        <button data-role="delete" data-id="${fileData.id}" class="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600 transition duration-200">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        });

        // Update the table body with the generated rows
        $('#tableBody').html(h);
    });

    $(document).on("click", `#onlyOthers`, () => {
        $('#onlyDocs').removeClass(' bg-blue-100 text-blue-500');
        $('#onlyPdf').removeClass(' bg-blue-100 text-blue-500');
        $('#allFiles').removeClass(' bg-blue-100 text-blue-500');
        $('#onlyImages').removeClass(' bg-blue-100 text-blue-500');
        $('#onlyMusics').removeClass(' bg-blue-100 text-blue-500');

        $('#onlyOthers').addClass(' bg-blue-100 text-blue-500')

        const knownTypes = [
            'application/pdf', // PDF
            'image/', // Image
            'application/msword', // .doc
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
            'application/vnd.ms-excel', // .xls
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-powerpoint', // .ppt
            'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
            'audio/', // Audio
        ];

        let otherFiles = filesArray.filter(file =>
            !knownTypes.some(type => file.type.startsWith(type))
        );
        let h = '';

        otherFiles.forEach((fileData, i) => {
            const mimeType = fileData.type;
            const base64Data = fileData.document;
            const fileUrl = `data:${mimeType};base64,${base64Data}`;

            h += `
            <tr class="hover:bg-blue-50 transition duration-200 border-b border-gray-200" data-id="${fileData.id}">
                <td class="px-4 py-3 text-gray-700">${i + 1}</td>
                <td class="px-4 py-3 text-gray-700">${fileData.name}</td>
                <td class="px-4 py-3 text-gray-700">${fileData.description}</td>
                <td class="px-4 py-3 text-gray-700">${formatDate(fileData.lastModified ?? fileData.createdAt)}</td>
                <td class="px-4 py-3 text-center">
                    <div class="flex justify-center space-x-2">
                        <button id="viewFileButton" data-id="${fileData.id}" class="bg-blue-500 text-white py-1 px-3 rounded-lg hover:bg-blue-600 transition duration-200">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button id="editButton" data-id="${fileData.id}" class="bg-yellow-500 text-white py-1 px-3 rounded-lg hover:bg-yellow-600 transition duration-200">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button id="view-as-pdf" data-id="${fileData.id}" class="bg-orange-500 text-white py-1 px-3 rounded-lg hover:bg-orange-600 transition duration-200">
                            <i class="fa-solid fa-file-pdf"></i>
                        </button>
                        <button data-role="delete" data-id="${fileData.id}" class="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600 transition duration-200">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        });

        // Update the table body with the generated rows
        $('#tableBody').html(h);
    });

    $(document).on('input', '#searchInput', function () {
        const searchTerm = $(this).val().toLowerCase();
        $('#tableBody tr').each(function () {
            const rowText = $(this).text().toLowerCase();
            if (rowText.includes(searchTerm)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });


        const nameSortIcon = document.getElementById('name-sort');
        const descriptionSortIcon = document.getElementById('description-sort');
        const dateSortIcon = document.getElementById('date-sort');

        let nameOrder = 'asc';
        let descriptionOrder = 'asc';
        let dateOrder = 'asc';

        nameSortIcon.addEventListener('click', () => {
            sortTable('name', nameOrder);
            nameOrder = nameOrder === 'asc' ? 'desc' : 'asc';
        });

        descriptionSortIcon.addEventListener('click', () => {
            sortTable('description', descriptionOrder);
            descriptionOrder = descriptionOrder === 'asc' ? 'desc' : 'asc';
        });

        dateSortIcon.addEventListener('click', () => {
            sortTable('date', dateOrder);
            dateOrder = dateOrder === 'asc' ? 'desc' : 'asc';
        });

        function sortTable(column, order) {
            const tableBody = document.querySelector('#tableBody');
            const rows = Array.from(tableBody.querySelectorAll('tr'));

            rows.sort((a, b) => {
                let aValue, bValue;

                switch (column) {
                    case 'name':
                        aValue = a.querySelector('td:nth-child(2)').innerText.toLowerCase();
                        bValue = b.querySelector('td:nth-child(2)').innerText.toLowerCase();
                        break;
                    case 'description':
                        aValue = a.querySelector('td:nth-child(3)').innerText.toLowerCase();
                        bValue = b.querySelector('td:nth-child(3)').innerText.toLowerCase();
                        break;
                    case 'date':
                        aValue = new Date(a.querySelector('td:nth-child(4)').innerText);
                        bValue = new Date(b.querySelector('td:nth-child(4)').innerText);
                        break;
                }

                if (order === 'asc') {
                    return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
                } else {
                    return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
                }
            });

            rows.forEach((row, index) => {
                row.querySelector('td:nth-child(1)').innerText = index + 1; // Update row number
                tableBody.appendChild(row);
            });
        }

});
