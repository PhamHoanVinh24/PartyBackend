using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("CUSTOMER")]
    public class Customers
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CusID { get; set; }

        [StringLength(maximumLength: 50)]
        public string CusCode { get; set; }

        [StringLength(maximumLength: 255)]
        public string CusName { get; set; }

        [StringLength(maximumLength: 50)]
        public string LotName { get; set; }

        [StringLength(maximumLength: 200)]
        public string Email { get; set; }

        [StringLength(maximumLength: 500)]
        public string Address { get; set; }

        [StringLength(maximumLength: 100)]
        public string Telephone { get; set; }

        [StringLength(maximumLength: 100)]
        public string MobilePhone { get; set; }

        [StringLength(maximumLength: 100)]
        public string Fax { get; set; }

        [StringLength(maximumLength: 100)]
        public string CusGroup { get; set; }

        [StringLength(maximumLength: 100)]
        public string ActivityStatus { get; set; }

        public string Description { get; set; }

        public bool? Flag { get; set; }

        [StringLength(maximumLength: 500)]
        public string GoogleMap { get; set; }
        
        [StringLength(255)]
        public string Identification { get; set; }

        [StringLength(255)]
        public string AddressBank { get; set; }

        [StringLength(255)]
        public string AccountBank { get; set; }

        [StringLength(20)]
        public string TaxCode { get; set; }

        [StringLength(maximumLength: 50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(maximumLength: 50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(maximumLength: 50)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }

        public string CusType{ get; set; }
        public string Status { get; set; }
        public string Area { get; set; }
        public string Group { get; set; }
        public string Role { get; set; }
        public string Resource { get; set; }
        public string Logo { get; set; }
        public string Transport { get; set; }
        public string InAgent { get; set; }
        public string Surrogate { get; set; }

        public string IconLevel { get; set; }
        public string ZipCode { get; set; }
        public string PersonInCharge { get; set; }
        public string ListUserView { get; set; }


    }
}