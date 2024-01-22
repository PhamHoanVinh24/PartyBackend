using III.Domain.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;

namespace ESEIM.Models
{
    [Table("PRODUCT_IN_PALLET")]
    public class ProductInPallet
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string ProductCode { get; set; }

        public int? IdImpProduct { get; set; }

        public string ProductNo {
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

        [StringLength(255)]
        public string GattrCode { get; set; }

        [StringLength(255)]
        public string StoreCode { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        [StringLength(50)]
        public string DeletionToken { get; set; }

        public bool IsDeleted { get; set; }

        [StringLength(255)]
        public string PackCode { get; set; }

        //[StringLength(255)]
        public decimal? Measure { get; set; }
        public int? IdLoadingTicket { get; set; }

        [NotMapped]
        public List<ProdStrNo> ListProdStrNo { get; set; }
    }
}
