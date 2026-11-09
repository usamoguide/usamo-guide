import * as React from 'react';
import { useState } from 'react';
import {
  useImportUserDataAction,
  useUserData,
} from '../../context/UserDataContext/UserDataContext';
import Btn from '../ug/Btn';
import { SettingsGroup } from './SettingRow';

export default function UserData() {
  const userData = useUserData();
  const importUserData = useImportUserDataAction();

  const handleExportUserData = () => {
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(userData)
    )}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', 'usamoguide-userdata.json');
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const [file, setFile] = useState('');
  const [resetInput, setResetInput] = useState(0);

  // https://stackoverflow.com/questions/61707105/react-app-upload-and-read-json-file-into-variable-without-a-server
  const handleUpload = e => {
    const file = e.target.files[0];
    if (file.type !== 'application/json') {
      alert('Must upload a JSON file.');
      return;
    }
    const fileReader = new FileReader();
    fileReader.readAsText(file, 'UTF-8');
    fileReader.onload = e => {
      setFile(e.target?.result as any);
    };
  };

  const handleImportUserData = e => {
    if (file === '') return;
    try {
      const data = JSON.parse(file);
      if (importUserData(data)) {
        setFile('');
        setResetInput(resetInput + 1); // clears file input
      }
    } catch (e) {
      alert(e);
      console.error(e);
    }
  };

  return (
    <>
      <SettingsGroup
        title="Export user data"
        description="Download your progress and settings as a JSON file."
      >
        <div>
          <Btn kind="s" size="sm" onClick={handleExportUserData}>
            Export user data
          </Btn>
        </div>
      </SettingsGroup>

      <SettingsGroup
        title="Import user data"
        description="Note that this will permanently override all existing user data. Use at your own risk!"
      >
        <div className="ap-import">
          {/* https://stackoverflow.com/questions/38731271/clear-an-input-field-with-reactjs */}
          {/* https://stackoverflow.com/questions/42192346/how-to-reset-reactjs-file-input */}
          <label className="ap-file">
            <span className="ap-label">JSON file</span>
            <input
              type="file"
              accept="application/json"
              onChange={handleUpload}
              key={resetInput}
            />
          </label>
          <Btn
            kind="p"
            size="sm"
            disabled={!file}
            onClick={handleImportUserData}
          >
            Import user data
          </Btn>
        </div>
      </SettingsGroup>
    </>
  );
}
