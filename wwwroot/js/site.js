$(document).ready(function () {
    alertify.set('notifier', 'position', 'top-right');

    $(`#saveButton`).on("click", () => {

        var formData = new FormData(document.getElementById('addForm'));
        console.log({ formData })

        $.ajax({
            url: '/Home/Create', 
            type: 'POST',
            data: formData,
            processData: false, 
            contentType: false,
            success: function (response) {
                alert('File uploaded successfully!');
            },
            error: function (error) {
                console.error('Error uploading file:', error);
            }
        });
    })

    // Modal Elements
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

            // Show the update button and hide the save button in edit mode
            $saveButton.addClass('hidden');
            $updateButton.removeClass('hidden');
        } else {
            $nameInput.val('');
            $descriptionInput.val('');
            $fileInput.val(null);

            // Show the save button and hide the update button in add mode
            $saveButton.removeClass('hidden');
            $updateButton.addClass('hidden');
        }
        $modal.removeClass('hidden');
    }

    // Close Modal Function
    function closeModal(id = null) {
    
            $('#addFileModal').addClass('hidden');
            $('#editFileModal').addClass('hidden');

    }

    // Save Button Click Event
    $saveButton.on('click', function () {
        const formData = {
            name: $nameInput.val(),
            description: $descriptionInput.val(),
            file: $fileInput[0].files[0] || null, // Handle file input
        };
        console.log('Collected Data:', formData);
        // Perform save operation (expand as needed)
        closeModal($('#newButton'));
    });

    // Update Button Click Event
    $updateButton.on('click', function () {
        const formData = {
            name: $nameInput.val(),
            description: $descriptionInput.val(),
            file: $fileInput[0].files[0] || null, // Handle file input
        };
        console.log('Collected Data:', formData);
        // Perform update operation (expand as needed)
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
