import { action, makeObservable, observable } from "mobx";
import { orderBy } from "lodash";
import BaseStore from "./baseStore";
import { Message, MessageFilterBy, MessageRefreshInterval } from "../types";
import AuthStore from "./authStore";
import { MessageURL, localStorageKey, refreshItems } from "../constants";

export default class MessageStore extends BaseStore<Message> {
  filterBy: MessageFilterBy = {};
  highlightWeight: number = 0;
  refreshInterval: MessageRefreshInterval = refreshItems[0];
  intervalId: number = 0;

  constructor(authStore: AuthStore) {
    super(authStore);
    makeObservable(this, {
      refreshInterval: observable,
      intervalId: observable,
      filterBy: observable,
      highlightWeight: observable,
      setFilterBy: action,
      setHighlightWeight: action,
      onListMessages: action,
      onChangeRefreshInterval: action,
      setIntervalId: action,
      onReset: action,
    });
  }

  setFilterBy(val: any) {
    this.filterBy = val;
  }

  setHighlightWeight(val: any) {
    this.highlightWeight = val;
  }

  setRefreshInterval(val: MessageRefreshInterval) {
    this.refreshInterval = val;
    localStorage.setItem(localStorageKey.msgInterval, JSON.stringify(val));
  }

  setIntervalId(val: number) {
    this.intervalId = val;
  }

  async onListMessages(url: string, filterBy?: any, page = 1) {
    const messages = await super.onList(url, filterBy, page, true);

    if (messages !== undefined && messages.length > 0) {
      const sortMessages = orderBy(messages, "weight", "desc");
      // find top 30% weight messages
      const minWeight =
        sortMessages.length > 1
          ? sortMessages[sortMessages.length - 1].weight
          : 0;
      const averageWeight = sortMessages[0].weight + minWeight / 2;
      const weight30Percent = averageWeight - averageWeight * 0.2;
      this.setHighlightWeight(weight30Percent);
      this.setData(sortMessages);
      return;
    }
    this.setData([]);
  }

  onExecRefreshInterval() {
    this.onList(MessageURL.list, this.filterBy);
  }

  onChangeRefreshInterval(intervalKey: number) {
    const refreshInterval = refreshItems.find(
      (refreshItem) => refreshItem.key === intervalKey
    );

    if (refreshInterval) {
      this.setRefreshInterval(refreshInterval);
      if (refreshInterval?.key === 0) {
        if (this.intervalId !== 0) {
          clearInterval(this.intervalId);
        }
        return;
      }
      const intervalId = setInterval(
        this.onExecRefreshInterval.bind(this),
        refreshInterval.key
      );
      this.setIntervalId(intervalId as any);
    }
  }

  onReset() {
    if (this.intervalId !== 0) {
      clearInterval(this.intervalId);
    }
    super.onReset();
  }
}
