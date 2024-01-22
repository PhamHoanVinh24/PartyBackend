using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("AD_LANGUAGE")]
    public class AdLanguage
    {
        public AdLanguage()
        {
            LanguageTexts = new HashSet<AdLanguageText>();
        }

        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int LanguageId { get; set; }

        [StringLength(maximumLength: 10)]
        public string Culture { get; set; }

        [StringLength(maximumLength: 256)]
        public string DisplayName { get; set; }

        [StringLength(maximumLength: 128)]
        public string Icon { get; set; }

        public int Ordering { get; set; }

        public bool IsEnabled { get; set; }
        public bool? IsDefault { get; set; }

        public DateTime? CreatedDate { get; set; }
        [StringLength(50)]
        public string CreatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        [StringLength(50)]
        public string UpdatedBy { get; set; }
        public DateTime? DeletedDate { get; set; }
        [StringLength(50)]
        public string DeletedBy { get; set; }
        public bool IsDeleted { get; set; }

        [JsonIgnore]
        public virtual ICollection<AdLanguageText> LanguageTexts { get; set; }
    }
}