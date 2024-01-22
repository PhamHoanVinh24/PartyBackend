using III.Domain.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;

namespace ESEIM.Models
{
    [Table("PACKAGE_TICKET_DT")]
    public class PackageTicketDt
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string TicketCode { get; set; }

        [StringLength(255)]
        public string ProductCode { get; set; }

        public int? IdImpProduct { get; set; }

        public string ProductNumRange
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
        public List<ProdStrNo> ListProdStrNo { get; set; }

        [StringLength(255)]
        public string GattrCode { get; set; }
        [StringLength(255)]
        public string PackCode { get; set; }

        public string StatusProductPallet { get; set; }
    }
}