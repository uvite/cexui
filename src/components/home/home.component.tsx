import React from 'react';
import { CgArrowRight } from 'react-icons/cg';

import { useSignIn } from '../../hooks/use-signin.hooks';
import { Layout } from '@arco-design/web-react';
const Sider = Layout.Sider;
const Header = Layout.Header;
const Footer = Layout.Footer;
const Content = Layout.Content;
import { Card, Link } from '@arco-design/web-react';
import { Button, Space } from '@arco-design/web-react';
import { Grid } from '@arco-design/web-react';
const Row = Grid.Row;
const Col = Grid.Col;

export const HomeComponent = () => {
  const signIn = useSignIn();

  return (
    <div>
      <Layout style={{ height: '1200px' }}>
        <Content style={{ height: '1200px' }}>
          <Row className="grid-demo" style={{ backgroundColor: 'var(--color-fill-2)' }}>
            <Col span={12} offset={8}>
              <Card style={{ width: 360 }} title="量化交易">
                <Button type="primary" onClick={signIn('home__navbar')}>
                  开始交易
                </Button>
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </div>
  );
};
