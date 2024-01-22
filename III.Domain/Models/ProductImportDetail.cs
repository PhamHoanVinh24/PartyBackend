using III.Domain.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;

namespace ESEIM.Models
{
    [Table("PRODUCT_IMPORT_DETAIL")]
    public class ProductImportDetail
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int? ParentId { get; set; }

        [StringLength(255)]
        public string TicketCode { get; set; }

        [StringLength(255)]
        public string LotProductCode { get; set; }

        [StringLength(255)]
        public string ProductCode { get; set; }
        public MaterialProduct Product { get; set; }
        //public WarehouseRecordsPack RecordsPack { get; set; }

        [StringLength(50)]
        public string ProductType { get; set; }

        [StringLength(255)]
        public string ProductQrCode { get; set; }

        public decimal Quantity { get; set; }

        [StringLength(50)]
        public string Unit { get; set; }

        public decimal? SalePrice { get; set; }

        [StringLength(50)]
        public string Currency { get; set; }

        public int? TaxRate { get; set; }

        public int? Discount { get; set; }

        public int? Commission { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }

        [StringLength(50)]
        public string DeletionToken { get; set; }

        [StringLength(255)]
        public string RackCode { get; set; }
        public decimal? QuantityIsSet { get; set; }
        [NotMapped]
        public string ProductCoil { get; set; }
        public string PackType { get; set; }
        public string ProductLot { get; set; }

        public string CusCode { get; set; }
        public string PoSupCode { get; set; }
        public string Section { get; set; }
        public int? QuantityImp { get; set; }

        public bool? IsIntact { get; set; }

        public bool? MarkWholeProduct { get; set; }

        [NotMapped]
        public string StoreCode { get; set; }
        [NotMapped]
        public string ProductCodeBottle { get; set; }
        [NotMapped]
        public int? ParentMappingId { get; set; }
        [NotMapped]
        public int? ParentProductNumber { get; set; }
        [NotMapped]
        public string ParentCustomJson { get; set; }
        [NotMapped]
        public string ParentFlatCode { get; set; }
        [NotMapped]
        public string MappingCode { get; set; }
        [NotMapped]
        public string GattrFlatCode { get; set; }
        public string PackCode { get; set; }
        public string PackLot { get; set; }
        public string ProdCustomJson { get; set; }
        public bool? IsCustomized { get; set; }
        public string ImpType { get; set; }
        public string GattrCode { get; set; }
        public string Status { get; set; }
        public string ProductNo
        {
            get
            {
                var listProductNo = new List<string>();
                if (ListProdStrNo != null)
                {
                    foreach (var item in ListProdStrNo)
                    {
                        listProductNo.Add(item.ToString()); 
                    }
                }
                return string.Join(", ", listProductNo);
            }
            set
            {
                var listItem = string.IsNullOrEmpty(value)
                    ? new List<string>()
                    : value.Split(", ").ToList();
                var listProductNo = new List<ProdStrNo>();
                foreach (var item in listItem)
                {
                    var prodStrNo = new ProdStrNo(item);
                    listProductNo.Add(prodStrNo);
                }
                ListProdStrNo = listProductNo;
            }
        }
        [NotMapped]
        public List<int> ListProductNo { get; set; }
        [NotMapped]
        public List<ProdStrNo> ListProdStrNo { get; set; }
        [NotMapped]
        public string UserName { get; set; }
        [NotMapped]
        public byte[] QrCode { get; set; }
        [NotMapped]
        public bool? IsMultiple { get; set; }

        public decimal? Weight { get; set; }
        /// <summary>
        /// Navigation property for the bottles fuel store in.
        /// </summary>
        public virtual ICollection<ProductInStock> BottleInStocks { get; set; }
        public virtual ICollection<ProductImportDetail> BottleDetails { get; set; }
        public virtual ICollection<ProductInStock> ProductInStocks { get; set; }
    }
}
