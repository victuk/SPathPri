


async function submitForm() {
    const name = document.getElementById("name");
    const files = document.getElementById("files");
    const formData = new FormData();
    formData.append("name", name.value);
    formData.append("file", files.files[0]);
  
    const res = await fetch("http://localhost:3000/v1/auth/test-file-upload", {
        method: 'POST',
        body: formData
    });
    const data = await res.json();
    console.log(data);
}