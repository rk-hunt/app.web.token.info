import { action, makeObservable, observable } from "mobx";
import BaseStore from "./baseStore";
import AuthStore from "./authStore";
import {
  SelectLabelInValue,
  Server,
  ServerFilterBy,
  ServerInfo,
} from "../types";
import { ProviderServerType, ProviderType } from "../constants";

export default class ServerStore extends BaseStore<Server> {
  serverInfo: ServerInfo = {} as any;
  filterBy: ServerFilterBy = {};
  providerTypes: SelectLabelInValue[] = [];

  constructor(authStore: AuthStore) {
    super(authStore);
    makeObservable(this, {
      serverInfo: observable,
      providerTypes: observable,
      filterBy: observable,
      setServerInfo: action,
      setProviderTypes: action,
      setFilterBy: action,
      onImport: action,
    });
  }

  setServerInfo(val: ServerInfo) {
    this.serverInfo = val;
  }

  setProviderTypes(providerType: ProviderType) {
    this.providerTypes =
      providerType === ProviderType.Discord
        ? [
            {
              value: ProviderServerType.DCServer,
              label: ProviderServerType.DCServer,
            },
          ]
        : [
            {
              value: ProviderServerType.TGChannel,
              label: ProviderServerType.TGChannel,
            },
            {
              value: ProviderServerType.TGGroup,
              label: ProviderServerType.TGGroup,
            },
          ];
  }

  setFilterBy(val: ServerFilterBy) {
    this.filterBy = val;
  }

  onReset(): void {
    super.onReset();
    this.setFilterBy({});
  }
}
