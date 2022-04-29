export const  appConfig = () => ({
    port: Number(process.env.PORT),
    database_telega:{
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        cluster:  process.env.DB_CLUSTER
    },
    database_locations:{
        username: process.env.DB_LOC_USER,
        password: process.env.DB_LOC_PASSWORD,
        database: process.env.DB_LOC_DATABASE,
        cluster:  process.env.DB_LOC_CLUSTER
    },
    auth: {
        secret: process.env.JWT_AUTH_SECRET,
        signOptions: { expiresIn: process.env.JWT_AUTH_EXPIRES },
        salt: process.env.SALT
    },
    telegram: {
        apiId: process.env.T_API_ID,
        apiHash: process.env.T_API_HASH
    },
    refresh :{
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES
    }
});
