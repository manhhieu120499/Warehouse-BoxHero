import request from "../utils/httpRequest"

export const findSupplier = async (supplierID) => {
    try{
        const res = await request.get(`/api/supplier/${supplierID}`)
        return res.data.supplier ? res.data.supplier : null
    }catch(err) {
        throw new Error(err)
    }
}