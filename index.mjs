import axios from "axios";

class AuthN {

    #config = {
        issuer: "",
        audiences: [],
        adminURL: "",
        username: "",
        password: "",
        keychainTTL: 0,
    }

    #axiosConfig = {}

    constructor(configur) {
        this.#config.issuer = configur.issuer;
        this.#config.audiences = Array.isArray(configur.audiences) ? configur.audiences : [configur.audiences];
        this.#config.adminURL = (configur.adminURL == null || configur.adminURL.length < 5) ? configur.issuer : configur.adminURL;
        this.#config.username = configur.username;
        this.#config.password = configur.password;
        this.#config.keychainTTL = configur.keychainTTL;

        this.#axiosConfig = {
            auth: {
                username: configur.username,
                password: configur.password,
            },
        };
    }

    async account(id) {
        return (
          await axios.get(this.#accountURL(id), this.#axiosConfig)
        ).data.result;
    }

    /**
     * 
     * @param id 
     * @param data  Object with content { username: string }
     */
    async updateAccount(id, data) {
        await axios.patch(this.#accountURL(id), data, this.#axiosConfig);
    }
    
    async archiveAccount(id) {
        await axios.delete(this.#accountURL(id), this.#axiosConfig);
    }
    
    async lockAccount(id) {
    await axios.patch(this.#accountURL(id, "lock"), {}, this.#axiosConfig);
    }
    
    async unlockAccount(id) {
        await axios.patch(this.#accountURL(id, "unlock"), {}, this.#axiosConfig);
    }
    
    /**
     * Imports an account via the private enpoint
     * 
     * @param data Object with format { username: string, password: string; locked: boolean }
     * @returns 
     */
    async importAccount(data) {
        return (
            await axios.post(
                `${this.#config.adminURL}/accounts/import`,
                data,
                this.#axiosConfig
            )
        ).data.result;
    }
    
    async expirePassword(id) {
        await axios.patch(
            this.#accountURL(id, "expire_password"),
            {},
            this.#axiosConfig
        );
    }
    
    async subjectFrom(idToken) {
        if (!idToken) return;
        return (await this.verifier(idToken))["sub"];
    }
    
    #accountURL(id, action="") {
        return `${this.#config.adminURL}/accounts/${id}${action.length > 0 ? `/${action}` : ""}`;
    }
}

export { AuthN };