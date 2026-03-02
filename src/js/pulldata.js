import supabase from './db.js'
async function getProducts() {
    console.log('getProducts')
    const { data, error } = await supabase.from('productos').select('nombre, sku')
    console.log(data)
    if (error) {
        console.error(error)
    }
    console.log(data)
}
export default getProducts

