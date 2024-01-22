using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace ESEIM.Models
{
    [Table("SET_COMPANY_MENU")]
    public class SetCompanyMenu
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string MenuCaption { get; set; }

        [StringLength(255)]
        public string Title { get; set; }

        [StringLength(255)]
        public string MenuParent { get; set; }

        public string Note { get; set; }

        [StringLength(255)]
        public string Action { get; set; }

        [StringLength(20)]
        public string Pin { get; set; }
        public int Priority { get; set; }

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
    }
}
