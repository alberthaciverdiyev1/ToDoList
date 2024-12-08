$(document).ready(function () {
    let filesArray = [];

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
                        <tr class="hover:bg-blue-50 transition duration-200 border-b border-gray-200">
                            <td class="px-4 py-3 text-gray-700">${i + 1} </td>
                            <td class="px-4 py-3 text-gray-700">${fileData.name}</td>
                            <td class="px-4 py-3 text-gray-700">${fileData.description}</td >
                            <td class="px-4 py-3 text-gray-700">${fileData.updatedAt ?? fileData.createdAt} </td>
                            <td class="px-4 py-3 text-center">
                                <div class="flex justify-center space-x-2">
                                    <button id="viewFileButton" data-id="${fileData.id}" class="bg-blue-500 text-white py-1 px-3 rounded-lg hover:bg-blue-600 transition duration-200">
                                        <i class="fas fa-eye"></i>
                                    </button> 
                                    <button id="editButton" class="bg-yellow-500 text-white py-1 px-3 rounded-lg hover:bg-yellow-600 transition duration-200">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button id="view-as-pdf" data-id="${fileData.id}" class="bg-orange-500 text-white py-1 px-3 rounded-lg hover:bg-orange-600 transition duration-200">
                                        <i class="fa-solid fa-file-pdf"></i>
                                    </button>
                                    <button class="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600 transition duration-200">
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
    // Listen for changes to the file input and preview the file
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
            };

            // Read the file as a data URL
            reader.readAsDataURL(file);
        }
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

    $('#editButton').on('click', function () {
        $(`#editFileModal`).removeClass("hidden")
    });
});
