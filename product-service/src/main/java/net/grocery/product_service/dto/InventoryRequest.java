package net.grocery.product_service.dto;

public class InventoryRequest {
    private  Integer quantity;

    public  Integer getQuantity(){
        return quantity;
    }

    public void setQuantity(Integer quantity){
        this.quantity = quantity;
    }
}
