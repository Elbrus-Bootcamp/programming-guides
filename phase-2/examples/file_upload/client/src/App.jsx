import { useRef, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);  // нужен для очитки отображаемого имени файла после загрузки


  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name_of_file_input", file); //  добавляем файл в formData
    formData.append("name", name); //  добавляем имя в formData

    try {
      const response = await axios.post(
        "http://localhost:3000/upload",
        formData, // передаем formData
        {
          headers: {
            "Content-Type": "multipart/form-data", // указываем тип контента
          },
        }
      );
      console.log("File uploaded successfully:", response.data);
      setFile(null);
      setName("");
      fileInputRef.current.value = '';
      
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
  return (
    <>
      <header onSubmit={handleSubmit} className="App-header">
        <form encType="multipart/form-data">
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
          <input
            type="file"
            name="name_of_file_input"
            onChange={(e) => setFile(e.target.files[0])}
            ref={fileInputRef} // нужно для очистки отображаемого имени файла после загрузки
          />
          <button type="submit">Submit</button>
        </form>
      </header>
    </>
  );
}

export default App;
