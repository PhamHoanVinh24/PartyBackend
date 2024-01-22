using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("PO_SUP_REQUEST_IMP_PRODUCT")]
    public class PoSupRequestImpProduct
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string PoSupCode { get; set; }

        public string ReqCode { get; set; }
    }
}
