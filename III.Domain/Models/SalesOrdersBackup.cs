using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("SALES_ORDERS_BACKUP")]
    public class SalesOrdersBackup
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public string OrderId { get; set; }
        public string OrderNumber { get; set; }
        public string OrderDate { get; set; }
        public string DeliveryDate { get; set; }
        public string Status { get; set; }
        public string StatusDescription { get; set; }
        public string OrderQuantity { get; set; }
        public string RemainingQuantity { get; set; }
        public string Discount { get; set; }

        public string UnitPrice { get; set; }

        public string OrderAmount { get; set; }
        public string PromoFlag { get; set; }
        public string DriverName { get; set; }
        public string VehicleCode { get; set; }
        public string Receiver { get; set; }
        public string Description { get; set; }
        public string DeliveryCode { get; set; }
        public string InvoiceNum { get; set; }
        public string ConversionDate { get; set; }
        public string ConversionRate { get; set; }
        public string InvoiceStatus { get; set; }
        public string BlanketNumber { get; set; }
        public string ShipFromOrgId { get; set; }
        public string ShipToOrgId { get; set; }
        public string InvoiceToOrgId { get; set; }
        public string InventoryItemId { get; set; }
        public string TransportMethodId { get; set; }
        public string TransactionTypeId { get; set; }
        public string UserId { get; set; }
        public string PriceListId { get; set; }
        public string CustomerId { get; set; }
        public string SourceDocumentLineId { get; set; }
        public DateTime? LastUpdateDate { get; set; }
        public string LastUpdatedBy { get; set; }
        public string CreationDate { get; set; }
        public string CreatedBy { get; set; }
        public string LastUpdateLogin { get; set; }
        public string OrderedItem { get; set; }
        public string CurrencyCode { get; set; }
        public string UomCode { get; set; }
        public string CheckpointId { get; set; }
        public string OrderType { get; set; }
        public string BlanketId { get; set; }
        public string CheckFlag { get; set; }
        public string ParentDeliveryCode { get; set; }
        public string PromotionConfirm { get; set; }
        public string SoFlag { get; set; }
        public string CancelDeliveryCode { get; set; }

        public string FreightAmount { get; set; }

        public string ReceiveMethod { get; set; }
        public string PackType { get; set; }

        public string ReceiverId { get; set; }
        public string BagType { get; set; }
        public string NonWeightDeliveryId { get; set; }
        public string OrderAmountOld { get; set; }
        public string OrderQuantityOld { get; set; }
        public string DiscountOld { get; set; }
        public string TnnmSo { get; set; }
        public string Msgh { get; set; }
        public string IpFlag { get; set; }
        public string VehicleWeightId { get; set; }
        public string InterorgHeaderId { get; set; }
        public string BsdId { get; set; }
        public string DocNum { get; set; }

        public string BookQuantity { get; set; }
        public string InvoiceFlag { get; set; }

        public string QuantityAvailable { get; set; }


        public string DiscountAvailable { get; set; }
        public string DocSeries { get; set; }
        public string DocTemplate { get; set; }
        public string LotNumber { get; set; }
        public string PrintStatus { get; set; }
        public string LocationCode { get; set; }
        public string DriverInfo { get; set; }

        public string ExCustomerId { get; set; }

        public string ExUnitPrice { get; set; }

        public string ShippointId { get; set; }

        public string TaxAmount { get; set; }

        public string TaxRate { get; set; }

        public string DataSource { get; set; }

        public string AreaId { get; set; }
        public string MoocCode { get; set; }

        public string BccStatus { get; set; }

        public string OrderShift { get; set; }
        public string OrderLog { get; set; }
        public string OrderAdjustType { get; set; }
        public string SyncFlag { get; set; }
        public string BookDate { get; set; }
        public string PrintDate { get; set; }
        public string ProductionLine { get; set; }

        public string BranchId { get; set; }
        public string BagMachine { get; set; }
        //public string FromDevice { get; set; }
    }



    public class SalesOrdersUpperNew
    {
        public string ORDER_ID { get; set; }
        public string ORDER_NUMBER { get; set; }
        public string ORDER_DATE { get; set; }
        public string DELIVERY_DATE { get; set; }
        public string STATUS { get; set; }
        public string STATUS_DESCRIPTION { get; set; }
        public string ORDER_QUANTITY { get; set; }
        public string REMAINING_QUANTITY { get; set; }
        public string DISCOUNT { get; set; }
        public string UNIT_PRICE { get; set; }
        public string ORDER_AMOUNT { get; set; }
        public string PROMO_FLAG { get; set; }
        public string DRIVER_NAME { get; set; }
        public string VEHICLE_CODE { get; set; }
        public string RECEIVER { get; set; }
        public string DESCRIPTION { get; set; }
        public string DELIVERY_CODE { get; set; }
        public string INVOICE_NUM { get; set; }
        public string CONVERSION_DATE { get; set; }
        public string CONVERSION_RATE { get; set; }
        public string INVOICE_STATUS { get; set; }
        public string BLANKET_NUMBER { get; set; }
        public string SHIP_FROM_ORG_ID { get; set; }
        public string SHIP_TO_ORG_ID { get; set; }
        public string INVOICE_TO_ORG_ID { get; set; }
        public string INVENTORY_ITEM_ID { get; set; }
        public string TRANSPORT_METHOD_ID { get; set; }
        public string TRANSACTION_TYPE_ID { get; set; }
        public string USER_ID { get; set; }
        public string PRICE_LIST_ID { get; set; }
        public string CUSTOMER_ID { get; set; }
        public string SOURCE_DOCUMENT_LINE_ID { get; set; }
        public DateTime? LAST_UPDATE_DATE { get; set; }
        public string LAST_UPDATED_BY { get; set; }
        public string CREATION_DATE { get; set; }
        public string CREATED_BY { get; set; }
        public string LAST_UPDATE_LOGIN { get; set; }
        public string ORDERED_ITEM { get; set; }
        public string CURRENCY_CODE { get; set; }
        public string UOM_CODE { get; set; }
        public string CHECKPOINT_ID { get; set; }
        public string ORDER_TYPE { get; set; }
        public string BLANKET_ID { get; set; }
        public string CHECK_FLAG { get; set; }
        public string PARENT_DELIVERY_CODE { get; set; }
        public string PROMOTION_CONFIRM { get; set; }
        public string SO_FLAG { get; set; }
        public string CANCEL_DELIVERY_CODE { get; set; }
        public string FREIGHT_AMOUNT { get; set; }
        public string RECEIVE_METHOD { get; set; }
        public string PACK_TYPE { get; set; }
        public string RECEIVER_ID { get; set; }
        public string BAG_TYPE { get; set; }
        public string NON_WEIGHT_DELIVERY_ID { get; set; }
        public string ORDER_AMOUNT_OLD { get; set; }
        public string ORDER_QUANTITY_OLD { get; set; }
        public string DISCOUNT_OLD { get; set; }
        public string TNNM_SO { get; set; }
        public string MSGH { get; set; }
        public string IP_FLAG { get; set; }
        public string VEHICLE_WEIGHT_ID { get; set; }
        public string INTERORG_HEADER_ID { get; set; }
        public string BSD_ID { get; set; }
        public string DOC_NUM { get; set; }
        public string BOOK_QUANTITY { get; set; }
        public string INVOICE_FLAG { get; set; }
        public string QUANTITY_AVAILABLE { get; set; }
        public string DISCOUNT_AVAILABLE { get; set; }
        public string DOC_SERIES { get; set; }
        public string DOC_TEMPLATE { get; set; }
        public string LOT_NUMBER { get; set; }
        public string PRINT_STATUS { get; set; }
        public string LOCATION_CODE { get; set; }
        public string DRIVER_INFO { get; set; }
        public string EX_CUSTOMER_ID { get; set; }
        public string EX_UNIT_PRICE { get; set; }
        public string SHIPPOINT_ID { get; set; }
        public string TAX_AMOUNT { get; set; }
        public string TAX_RATE { get; set; }
        public string DATA_SOURCE { get; set; }
        public string AREA_ID { get; set; }
        public string MOOC_CODE { get; set; }
        public string BCC_STATUS { get; set; }
        public string ORDER_SHIFT { get; set; }
        public string ORDER_LOG { get; set; }
        public string ORDER_ADJUST_TYPE { get; set; }
        public string SYNC_FLAG { get; set; }
        public string BOOK_DATE { get; set; }
        public string PRINT_DATE { get; set; }
        public string PRODUCTION_LINE { get; set; }
        public string BRANCH_ID { get; set; }
        public string BAG_MACHINE { get; set; }
    }
}
