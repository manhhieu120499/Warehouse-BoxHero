import request from "../utils/httpRequest";
export const searchCustomer = async (customerID) => {
    try{
        const res = await request.get(`/api/customer/find/${customerID}`);
        return res?.data?.data || null
    }catch(error){
        console.error("Error searching customer:", error);
        throw new Error(error.response.data)
    }
}