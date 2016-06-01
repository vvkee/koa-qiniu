import _ from 'lodash'
import qiniu from 'qiniu'
import moment from 'moment'
export default config => {
    const {
        bucket = 'your_bucket',
        ACCESS_KEY = 'your_qiniu_ACCESS_KEY',
        SECRET_KEY = 'your_qiniu_SECRET_KEY',
        baseUrl = 'your qiniu url',
        hash = false // 如果为true的时候，那么文件名会生成一串当前日期的时间戳
    } = config

    // 设置qiniu的秘钥
    qiniu.conf.ACCESS_KEY = config.ACCESS_KEY
    qiniu.conf.SECRET_KEY = config.SECRET_KEY
    console.log('config', config)

    return async (ctx, next) => {

        const files = ctx.request.files

        if (_.isEmpty(files)) {
            console.log('没有上传的文件')
            await next()
            return
        }

        console.log('有文件要上传')
        // console.log('files', files)

        ctx.qiniu = {
            files: {},
            baseUrl: config.baseUrl
        }

        _.forEach(files, (file, name) => {
            const uptoken = getUptoken(file.name, config)
            ctx.qiniu.files[name] = upload(uptoken, file.path, config)
        })

        await next()

    }
}

/**
 * 上传文件到七牛云
 * @param  {[string]} key       [key值，目前取文件名]
 * @param  {[string]} localFile [上传的本地路径]
 * @param  {[object]} qiniuConf [七牛云的配置，ACCESS_KEY，SECRET_KEY]
 * @param  {[boolean]} hash      [hash，true的时候key值加上时间戳]
 * @return {[Promise]}           [返回Promise异步函数]
 */
const upload = (uptoken, localFile, config) => {

    if (_.isEmpty(uptoken)) return

    const extra = new qiniu.io.PutExtra()

    console.log('uptoken', uptoken)
    return new Promise((resolve, reject) => {
        qiniu.io.putFile(uptoken, null, localFile, extra, (err, ret) => {
            if (!err) {
                console.log(ret.hash, ret.key, ret.persistentId)
                resolve({
                    hash: ret.hash,
                    key: ret.key,
                    url: `${config.baseUrl}/${ret.key}`
                })
            } else {
                console.log(err)
                reject(err)
            }
        })
    })
}


/**
 * 获取七牛云的token
 * @param  {[string]} key       [key值，目前取文件名]
 * @param  {[object]} qiniuConf [七牛云的配置，ACCESS_KEY，SECRET_KEY]
 * @param  {[boolean]} hash      [hash，true的时候key值加上时间戳]
 * @return {[string]}           [返回七牛云生成的token]
 */
const getUptoken = (key, qiniuConf) => {
    if (_.isEmpty(key)) return
    if (qiniuConf.hash) {
        key = `${key}_${moment().format('YYYYMMDDHHmmss')}`
    }

    const putPolicy = new qiniu.rs.PutPolicy(`${qiniuConf.bucket}/${key}`)
    return putPolicy.token()
}
