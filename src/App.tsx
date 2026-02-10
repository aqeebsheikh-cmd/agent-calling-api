import { ChatProvider } from './context/ChatContext';
import Sidebar from './components/Sidebar/Sidebar';
import ChatArea from './components/ChatArea/ChatArea';
import styles from './App.module.css';

function App() {
  return (
    <ChatProvider>
      <div className={styles.app}>
        <Sidebar />
        <ChatArea />
      </div>
    </ChatProvider>
  );
}

export default App;
