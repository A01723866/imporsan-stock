import supabase from './db.js'

async function getProducts() {
    console.log('getProducts')
    const { data, error } = await supabase.from('productos').select('nombre, sku, modelo')
    if (error) {
        console.error(error)
    }
    return data
}
export default getProducts

