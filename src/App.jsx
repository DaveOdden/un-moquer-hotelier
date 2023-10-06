import './App.css'
import React from 'react';
import { Layout, Space } from 'antd';
const { Header, Footer, Sider, Content } = Layout;

const headerStyle = {
  textAlign: 'center',
  color: '#fff',
  height: 64,
  paddingInline: 50,
  lineHeight: '64px',
  backgroundColor: '#7dbcea',
};

const contentStyle = {
  textAlign: 'center',
  height: 'calc(100vh - 133px)',
  color: '#fff',
  backgroundColor: '#108ee9',
};

const footerStyle = {
  textAlign: 'center',
  color: '#fff',
  backgroundColor: '#7dbcea',
};

const App = () => {
  return (
    <Space
      direction="vertical"
      style={{
        width: '100%',
      }}
      size={[0, 48]}
    >
      <Layout>
        <Header style={headerStyle}>Header</Header>
        <Content style={contentStyle}>Content</Content>
        <Footer style={footerStyle}>Footer</Footer>
      </Layout>
    </Space>
  )
}

export default App
