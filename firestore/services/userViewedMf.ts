const { BaseFireStoreService } = require("./base");
const { IUserViewedMf } = require("../types/userViewedMf");
const { COLLECTION_NAME } = require("../constants");

class UserViewedMfFireStoreService extends BaseFireStoreService<IUserViewedMf> {
    constructor() {
        super(BaseFireStoreService.getEnvCollection(`${COLLECTION_NAME.USERS}/${COLLECTION_NAME.USER_VIEWED_MFS}`));
    }
}

export const userViewedMfFireStoreService = new UserViewedMfFireStoreService();
