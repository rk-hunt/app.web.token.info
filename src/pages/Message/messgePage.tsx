import { memo, useCallback, useEffect, useMemo } from "react";
import { observer } from "mobx-react-lite";
import dayjs from "dayjs";
import {
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Layout,
  Popover,
  Row,
  Select,
  Table,
  TableColumnsType,
} from "antd";
import { DeleteOutlined, FilterOutlined } from "@ant-design/icons";
import useStores from "../../stores";
import { Header, Page } from "../../components";
import { MessageURL, datetimeFormat } from "../../constants";
import { MessageFilterBy } from "../../types";

const { Content } = Layout;
const { RangePicker } = DatePicker;

const MessagePage: React.FC = () => {
  const { messageStore, providerStore } = useStores();
  const { data: providers } = providerStore;
  const { data, isFetching, pageContext, highlightWeight } = messageStore;

  const [form] = Form.useForm<any>();

  const onPaginationChanged = useCallback(
    (page: number, _: number) => {
      messageStore.onList(MessageURL.list, {}, page);
    },
    [messageStore]
  );

  const onApplyFilter = useCallback(
    (values: any) => {
      const filter: MessageFilterBy = {
        ...messageStore.filterBy,
        ...values,
      };

      messageStore.setFilterBy(filter);
      messageStore.onListMessages(MessageURL.list, filter);
    },
    [messageStore]
  );

  const tableColumns = useMemo(() => {
    const columns: TableColumnsType<any> = [
      {
        title: "Provider Name",
        dataIndex: "provider_name",
      },
      {
        title: "Server Name",
        dataIndex: "server_name",
      },
      {
        title: "Channel Name",
        dataIndex: "channel_name",
      },
      {
        title: "Author",
        dataIndex: "author_username",
      },
      {
        title: "Received At",
        dataIndex: "received_at",
        render: (value: number) => {
          return dayjs(value).format(datetimeFormat);
        },
      },
      {
        title: "Created At",
        dataIndex: "created_at",
        render: (value: number) => {
          return dayjs(value).format(datetimeFormat);
        },
      },
      {
        title: "Updated At",
        dataIndex: "updated_at",
        render: (value: number) => {
          return value === 0 ? "-" : dayjs(value).format(datetimeFormat);
        },
      },
      {
        title: "",
        dataIndex: "",
        render: (_: any) => {
          return <Button icon={<DeleteOutlined />} size="small" />;
        },
      },
    ];

    return columns;
  }, [highlightWeight]);

  const filterForm = useMemo(() => {
    return (
      <Form
        layout="vertical"
        form={form}
        name="filter_form"
        onFinish={onApplyFilter}
        style={{ padding: 8, width: 300 }}
      >
        <Form.Item label="Provider" name="provider_id">
          <Select
            placeholder="Discord"
            options={providers.map((provider) => ({
              value: provider._id,
              label: provider.name,
            }))}
            allowClear
          />
        </Form.Item>
        <Form.Item label="Auth Username" name="author_username">
          <Input placeholder="Username" allowClear />
        </Form.Item>
        <Form.Item label="Channel Id" name="channel_id">
          <Input placeholder="00001" allowClear />
        </Form.Item>
        <Form.Item label="Received At" name="received_at">
          <RangePicker
            presets={[
              { label: "Today", value: [dayjs(), dayjs()] },
              {
                label: "This Week",
                value: [dayjs().startOf("week"), dayjs().endOf("week")],
              },
              {
                label: "This Month",
                value: [dayjs().startOf("month"), dayjs().endOf("month")],
              },
            ]}
            placeholder={["Start Date", "End Date"]}
          />
        </Form.Item>
        <Form.Item label="Content" name="content">
          <Input placeholder="Content" allowClear />
        </Form.Item>
        <Button type="primary" block htmlType="submit">
          Apply
        </Button>
      </Form>
    );
  }, [form, providers, onApplyFilter]);

  useEffect(() => {
    messageStore.onListMessages(MessageURL.list);
    return () => {
      messageStore.onReset();
    };
  }, [messageStore]);

  return (
    <Content>
      <Header title="Messages" />
      <Page title="Messages">
        <Row>
          <Col span={24} style={{ marginBottom: 24 }}>
            <Flex justify="space-between">
              <Popover
                content={filterForm}
                trigger="click"
                placement="bottomLeft"
                arrow={false}
              >
                <Button icon={<FilterOutlined />}>Filter</Button>
              </Popover>
            </Flex>
          </Col>
          <Col span={24}>
            <Table
              rowKey="_id"
              columns={tableColumns}
              dataSource={data}
              loading={isFetching}
              pagination={{
                hideOnSinglePage: true,
                size: "default",
                pageSize: pageContext.per_page,
                current: pageContext.current_page,
                total: pageContext.total,
                showTotal: (total: number, range: any) =>
                  `${range[0]}-${range[1]} of ${total}`,
                onChange: onPaginationChanged,
              }}
            />
          </Col>
        </Row>
      </Page>
    </Content>
  );
};

export default memo(observer(MessagePage));