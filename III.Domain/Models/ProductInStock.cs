using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using III.Domain.Common;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace ESEIM.Models
{
    [Table("PRODUCT_IN_STOCK")]
    public class ProductInStock
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int? IdImpProduct { get; set; }
        [InverseProperty("ProductInStocks")]
        public ProductImportDetail Detail { get; set; }

        public int? ParentId { get; set; }

        [StringLength(255)]
        public string LotProductCode { get; set; }

        [StringLength(255)]
        public string ProductCode { get; set; }
        public MaterialProduct Product { get; set; }

        [StringLength(50)]
        public string ProductType { get; set; }

        [StringLength(255)]
        public string ProductQrCode { get; set; }

        public decimal Quantity { get; set; }

        public decimal? Weight { get; set; }

        [StringLength(50)]
        public string Unit { get; set; }

        [StringLength(50)]
        public string StoreCode { get; set; }

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

        public bool? MarkWholeProduct { get; set; }
        public string PackCode { get; set; }
        public string ProdCustomJson { get; set; }
        public bool? IsCustomized { get; set; }
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
        public byte[] QrCode { get; set; }
    }
}
