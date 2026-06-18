# -*- coding: utf-8 -*-
"""
Genera dataset/data.js: agregaciones precalculadas del reporte (Etapas 1-4) + pool de
jugadores para los 3 dashboards prescriptivos. Toda la lógica replica fielmente los
notebooks entregados (Proyecto_Fase_I..IV). Ejecutar:  python export_web_data.py
"""
import numpy as np, pandas as pd, os, json
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA

HERE = os.path.dirname(os.path.abspath(__file__))
# CSV final: se prefiere la copia local del paquete (proyecto autocontenido);
# si no está, se usa la carpeta original del proyecto como respaldo.
CSV_LOCAL = os.path.join(HERE, 'archivo_final_proyecto_entrega.csv')
CSV_ROOT = os.path.join(HERE, '..', '..', 'Dataset_final_usado', 'archivo_final_proyecto_entrega.csv')
CSV = CSV_LOCAL if os.path.exists(CSV_LOCAL) else CSV_ROOT
df = pd.read_csv(CSV)

# dimensiones y nulos del dataset ENTREGADO (antes de añadir columnas auxiliares)
ORIG_ROWS, ORIG_COLS = df.shape
ORIG_NULLS = df.isnull().sum()
ORIG_DUPES = int(df.duplicated(subset=['player_id', 'Season']).sum())

# features de apoyo
# Region: mapeo explícito liga -> región, IDÉNTICO al de Proyecto_Fase_II.ipynb
# (la jerarquía Región -> Liga -> Club del modelo dimensional se construye desde aquí).
REGION_MAP = {
    # Europa
    'Spain Primera Division': 'Europa', 'German 1. Bundesliga': 'Europa', 'French Ligue 1': 'Europa',
    'English Premier League': 'Europa', 'Italian Serie A': 'Europa', 'Turkish Süper Lig': 'Europa',
    'Russian Premier League': 'Europa', 'Portuguese Liga ZON SAGRES': 'Europa', 'Danish Superliga': 'Europa',
    'Holland Eredivisie': 'Europa', 'Spanish Segunda División': 'Europa', 'English League Championship': 'Europa',
    'Greek Super League': 'Europa', 'Austrian Football Bundesliga': 'Europa', 'Swiss Super League': 'Europa',
    'German 2. Bundesliga': 'Europa', 'Belgian Jupiler Pro League': 'Europa', 'Scottish Premiership': 'Europa',
    'Italian Serie B': 'Europa', 'Norwegian Eliteserien': 'Europa', 'Polish T-Mobile Ekstraklasa': 'Europa',
    'French Ligue 2': 'Europa', 'Swedish Allsvenskan': 'Europa', 'Scottish Championship': 'Europa',
    'English League One': 'Europa', 'English League Two': 'Europa', 'Rep. Ireland Airtricity League': 'Europa',
    'Finnish Veikkausliiga': 'Europa', 'Czech Republic Gambrinus Liga': 'Europa', 'German 3. Bundesliga': 'Europa',
    'Croatian Prva HNL': 'Europa', 'Romanian Liga I': 'Europa', 'Hungarian Nemzeti Bajnokság I': 'Europa',
    'Cypriot First Division': 'Europa', 'Ukrainian Premier League': 'Europa', 'Ligue 1': 'Europa',
    'La Liga': 'Europa', 'Premier League': 'Europa', 'Bundesliga': 'Europa', 'Pro League': 'Europa',
    'Serie A': 'Europa', 'Super Lig': 'Europa', 'Eredivisie': 'Europa', 'Liga Portugal': 'Europa',
    'Jupiler Pro League': 'Europa', 'Super League': 'Europa', '1. HNL': 'Europa', 'La Liga 2': 'Europa',
    'Serie B': 'Europa', 'Superliga': 'Europa', 'Premiership': 'Europa', 'Fortuna Liga': 'Europa',
    'Championship': 'Europa', 'Ligue 2': 'Europa', 'Allsvenskan': 'Europa', '2. Bundesliga': 'Europa',
    'Eliteserien': 'Europa', 'Ekstraklasa': 'Europa', 'League One': 'Europa', '1. Division': 'Europa',
    '3. Liga': 'Europa', 'Veikkausliiga': 'Europa', 'League Two': 'Europa', 'National League': 'Europa',
    'English National League': 'Europa', 'Paris Saint-Germain': 'Europa',
    # América del Norte
    'USA Major League Soccer': 'America del Norte', 'Mexican Liga MX': 'America del Norte',
    'Major League Soccer': 'America del Norte', 'Liga MX': 'America del Norte',
    # América del Sur
    'Argentina Primera División': 'America del Sur', 'Chilian Campeonato Nacional': 'America del Sur',
    'Colombian Liga Postobón': 'America del Sur', 'Campeonato Brasileiro Série A': 'America del Sur',
    'Campeonato Brasileiro Série B': 'America del Sur', 'Uruguayan Primera División': 'America del Sur',
    'Paraguayan Primera División': 'America del Sur', 'Ecuadorian Serie A': 'America del Sur',
    'Peruvian Primera División': 'America del Sur', 'Liga de Fútbol Profesional Boliviano': 'America del Sur',
    'Venezuelan Primera División': 'America del Sur', 'Liga Profesional': 'America del Sur',
    'Primera Division': 'America del Sur', 'Primera División': 'America del Sur', 'Liga Pro': 'America del Sur',
    'Liga BetPlay': 'America del Sur', 'Liga 1': 'America del Sur', 'Liga De Futbol Prof': 'America del Sur',
    # Asia
    'Korean K League 1': 'Asia', 'Japanese J. League Division 1': 'Asia', 'Chinese Super League': 'Asia',
    'Indian Super League': 'Asia', 'Saudi Abdul L. Jameel League': 'Asia', 'UAE Arabian Gulf League': 'Asia',
    'K League 1': 'Asia', 'J-League': 'Asia',
    # Oceanía
    'Australian Hyundai A-League': 'Oceania', 'A-League': 'Oceania',
    # África
    'South African Premier Division': 'Africa', 'Premier Division': 'Africa',
    # Desconocido
    'Unknown': 'Desconocido', 'Rest of World': 'Desconocido', 'NB I.': 'Europa',  # Liga húngara
}
# Fase IV: GK/DEF/MID/ATT desde PosicionPrincipal
CAT = {'GK':'Portero','CB':'Defensa','LB':'Defensa','RB':'Defensa','LWB':'Defensa','RWB':'Defensa',
       'CDM':'Mediocampista','CM':'Mediocampista','CAM':'Mediocampista','LM':'Mediocampista','RM':'Mediocampista',
       'CF':'Delantero','ST':'Delantero','LW':'Delantero','RW':'Delantero'}
df['Region'] = df['league_name'].map(REGION_MAP).fillna('Desconocido')
df['GrupoPosicion'] = df['PosicionPrincipal'].map(CAT).fillna('Otro')
df['vpr'] = df['value_eur'] / df['overall'].replace(0, np.nan)          # valor por rating (Fase IV)
df['Margen'] = df['value_eur'] - df['wage_eur']                          # Fase II
df['brecha'] = df['potential'] - df['overall']                          # = BrechaPotencial

S = int(df.Season.max())
dS = df[df.Season == S].copy()                                          # temporada actual (reporte)
# Fase IV: una fila por jugador = su temporada más reciente (pool prescriptivo)
df_best = df.sort_values('Season', ascending=False).drop_duplicates('player_id').copy()
df_best = df_best[df_best['value_eur'] > 0].copy()

AGE_ORDER = ['Young', 'Prime', 'Veteran']

def kv(s):  return [{'k': str(k), 'v': float(round(v, 2))} for k, v in s.items()]
def top(s, n=10): return s.sort_values(ascending=False).head(n)
def hist(series, bins):
    c, e = np.histogram(series.dropna(), bins=bins)
    return {'labels': [f'{int(e[i])}–{int(e[i+1])}' for i in range(len(c))], 'counts': [int(x) for x in c]}
def boxstats(series):
    s = series.dropna()
    q1, med, q3 = [float(x) for x in s.quantile([.25, .5, .75])]
    iqr = q3 - q1
    lo, hi = q1 - 1.5 * iqr, q3 + 1.5 * iqr
    return {'min': float(s.min()), 'q1': q1, 'med': med, 'q3': q3, 'max': float(s.max()),
            'lo': float(max(s.min(), lo)), 'hi': float(min(s.max(), hi)),
            'outliers': int(((s < lo) | (s > hi)).sum())}
def stat_row(name, series):
    s = series.dropna()
    return {'var': name, 'mean': round(float(s.mean()), 2), 'median': round(float(s.median()), 2),
            'mode': round(float(s.mode().iloc[0]), 2), 'min': round(float(s.min()), 2),
            'q1': round(float(s.quantile(.25)), 2), 'q3': round(float(s.quantile(.75)), 2),
            'max': round(float(s.max()), 2), 'iqr': round(float(s.quantile(.75) - s.quantile(.25)), 2),
            'std': round(float(s.std()), 2), 'skew': round(float(s.skew()), 2)}

data = {'season': S, 'seasons': [int(x) for x in sorted(df.Season.unique())],
        'kpis': {'players': int(len(df)), 'value': float(dS['value_eur'].sum()),
                 'unique': int(df['player_id'].nunique()), 'clubs': int(df['club_name'].nunique()),
                 'leagues': int(df['league_name'].nunique()), 'seasonsLabel': '2015–2024'}}

# ETAPA 1 — Limpieza
total_cells = ORIG_ROWS * ORIG_COLS
nulls = ORIG_NULLS
data['e1'] = {
 'quality': {'rows': int(ORIG_ROWS), 'cols': int(ORIG_COLS),
             'pctNulls': round(float(nulls.sum() / total_cells * 100), 2),
             'dupes': ORIG_DUPES,
             'seasons': int(df.Season.nunique())},
 # diccionario de datos (columnas clave, rangos razonables)
 'dict': [
   {'col': 'age', 'tipo': 'int', 'rango': '16–45', 'desc': 'Edad del jugador'},
   {'col': 'overall', 'tipo': 'int', 'rango': '0–100', 'desc': 'Rating global actual'},
   {'col': 'potential', 'tipo': 'int', 'rango': '0–100', 'desc': 'Techo proyectado'},
   {'col': 'value_eur', 'tipo': 'float', 'rango': '≥ 0', 'desc': 'Valor de mercado (€)'},
   {'col': 'wage_eur', 'tipo': 'float', 'rango': '≥ 0', 'desc': 'Salario (€)'},
   {'col': 'preferred_foot', 'tipo': 'cat', 'rango': 'Right/Left', 'desc': 'Pie dominante'}],
 # 6 features derivados (Fase I)
 'features': [
   {'name': 'GrupoEdad', 'regla': 'Young <21 · Prime 21–28 · Veteran >28'},
   {'name': 'GrupoValor', 'regla': 'Bajo <€300K · Medio ≤€1.6M · Alto >€1.6M'},
   {'name': 'GrupoAltura', 'regla': 'Bajo <175 · Medio ≤185 · Alto >185 cm'},
   {'name': 'BrechaPotencial', 'regla': 'potential − overall'},
   {'name': 'PosicionPrincipal', 'regla': '1.ª posición de player_positions'},
   {'name': 'EficienciaFinanciera', 'regla': 'value_eur / wage_eur'}],
 # 3 features de seguridad (flags)
 'flags': [
   {'k': 'Edad sospechosa (<16 o >45)', 'v': int(df['edad_sospechosa'].sum())},
   {'k': 'Habilidades bajas (drib≤5 o pace≤21)', 'v': int(df['flag_habilidades_bajas'].sum())},
   {'k': 'Valor/salario inconsistente', 'v': int(df['flag_valor_salario'].sum())}],
 'nullsTop': kv(top((nulls / len(df) * 100)[nulls > 0], 8)),
 'ageGroupDist': kv(df['GrupoEdad'].value_counts().reindex(AGE_ORDER)),
 'valueGroupDist': kv(df['GrupoValor'].value_counts().reindex(['Bajo', 'Medio', 'Alto'])),
 'heightGroupDist': kv(df['GrupoAltura'].value_counts().reindex(['Bajo', 'Medio', 'Alto'])),
 'posicionDist': kv(df['PosicionPrincipal'].value_counts().head(15)),
'brechaHist': hist(df['brecha'], 10),
'eficienciaHist': hist(df[df['EficienciaFinanciera'].replace([np.inf, -np.inf], np.nan).notna()]['EficienciaFinanciera'].clip(0, 50), 10),
}

# ETAPA 2 — Dimensional
piv = dS.pivot_table(index='GrupoPosicion', columns='GrupoEdad', values='overall', aggfunc='mean').reindex(columns=AGE_ORDER)
# drill-down Region -> Liga (valor promedio)
drill = dS.groupby(['Region', 'league_name'])['value_eur'].mean().sort_values(ascending=False).head(10)
data['e2'] = {
 'topClubsValue': kv(top(dS.groupby('club_name')['value_eur'].mean())),
 'regionValue': kv(dS.groupby('Region')['value_eur'].sum().sort_values(ascending=False)),
 'positions': list(piv.index),
 'young': [float(round(x, 1)) for x in piv['Young'].fillna(0)],
 'prime': [float(round(x, 1)) for x in piv['Prime'].fillna(0)],
 'veteran': [float(round(x, 1)) for x in piv['Veteran'].fillna(0)],
 'marginClubs': kv(top(dS.groupby('club_name')['Margen'].sum())),
 'drilldown': [{'k': f'{r} · {l}', 'v': float(round(v, 0))} for (r, l), v in drill.items()],
}

# ETAPA 3 — EDA
UNI = [('age', 'age'), ('overall', 'overall'), ('potential', 'potential'),
       ('value_eur', 'value'), ('wage_eur', 'wage'), ('brecha', 'BrechaPotencial'), ('pace', 'pace')]
corr_vars = ['age', 'overall', 'potential', 'value_eur', 'wage_eur', 'brecha', 'pace']
cm = df[corr_vars].corr().round(2)
# Etapa 3 = análisis EDA sobre TODO el dataset (10 temporadas), igual que los notebooks.
# Excepción: los gráficos por LIGA usan solo 2024, porque en este CSV los nombres de liga
# cambian entre temporadas (102 nombres para ~45 ligas) y agregarlos por todo el df los fragmentaría.
foot = df[df['preferred_foot'].isin(['Right', 'Left'])]
sOV = df[df.value_eur > 0]
sPW = df[df.wage_eur > 0]
# Para "combinación edad+posición": taxonomía club_position EXACTA de Fase III (excluye SUB/RES/Unknown)
def _grp_cp(pos):
    if pos in ['CB', 'LCB', 'RCB', 'LB', 'RB', 'LWB', 'RWB']: return 'Defensores'
    if pos in ['CM', 'LCM', 'RCM', 'CDM', 'LDM', 'RDM', 'CAM', 'LAM', 'RAM', 'LM', 'RM']: return 'Mediocampistas'
    if pos in ['ST', 'CF', 'LW', 'RW', 'LF', 'RF', 'LS', 'RS']: return 'Ofensivos'
    if pos == 'GK': return 'Porteros'
    return 'Otros'
_heat = df[df.club_position.notna() & ~df.club_position.isin(['SUB', 'RES', 'Unknown'])].copy()
_heat['cp'] = _heat['club_position'].apply(_grp_cp); _heat = _heat[_heat.cp != 'Otros']
VAP_ORDER = ['Porteros', 'Defensores', 'Mediocampistas', 'Ofensivos']
data['e3'] = {
 'stats': [stat_row(lbl, df[col]) for col, lbl in UNI],
 'hist': {lbl: hist(df[col] if col not in ('value_eur', 'wage_eur') else np.log10(df[col].replace(0, 1)), 12) for col, lbl in UNI},
 'box': {lbl: boxstats(df[col]) for col, lbl in UNI},
 'topNat': kv(df['nationality'].value_counts().head(10)),
 'topClubs': kv(df[df['club_name'] != 'Unknown']['club_name'].value_counts().head(10)),  # excluye placeholder (Fase III)
 'posDist': kv(df['GrupoPosicion'].value_counts()),
 'footDist': kv(df['preferred_foot'].value_counts()),
 'natBestRating': kv(top(df[df.groupby('nationality')['nationality'].transform('size') >= 50].groupby('nationality')['overall'].mean())),
 # bivariante
 'corr': {'labels': corr_vars, 'matrix': cm.values.tolist()},
 'scatterOV': [{'x': int(a), 'y': int(b)} for a, b in sOV.sample(min(400, len(sOV)), random_state=1)[['overall', 'value_eur']].values],
 'scatterPW': [{'x': int(a), 'y': int(b)} for a, b in sPW.sample(min(400, len(sPW)), random_state=2)[['potential', 'wage_eur']].values],
 'valueByPos': kv(df.groupby('GrupoPosicion')['value_eur'].median().sort_values(ascending=False)),
 'overallByLeague': kv(dS[dS.league_name.isin(dS.league_name.value_counts().head(8).index)].groupby('league_name')['overall'].mean().sort_values(ascending=False)),  # solo 2024 (nombres de liga consistentes)
 'wageByAge': kv(df.groupby('GrupoEdad')['wage_eur'].median().reindex(AGE_ORDER)),
 'potByNat': kv(top(df[df.groupby('nationality')['nationality'].transform('size') >= 50].groupby('nationality')['potential'].mean())),
 'overallByFoot': kv(foot.groupby('preferred_foot')['overall'].mean()),
 'corrPairs': {'high': [['value_eur × wage_eur', 0.78], ['age × BrechaPotencial', -0.84]],
               'low': [['age × value_eur', 0.07], ['pace × BrechaPotencial', 0.06]]},
 # multivariante (valor PROMEDIO por posición y edad, igual que el heatmap de Fase III)
 'youngBestPaidByPos': kv(df[df.GrupoEdad == 'Young'].groupby('GrupoPosicion')['wage_eur'].median().sort_values(ascending=False)),
 'valueByAgePos': {'positions': VAP_ORDER,
                   'young': kv(_heat[_heat.GrupoEdad == 'Young'].groupby('cp')['value_eur'].mean().reindex(VAP_ORDER).fillna(0)),
                   'prime': kv(_heat[_heat.GrupoEdad == 'Prime'].groupby('cp')['value_eur'].mean().reindex(VAP_ORDER).fillna(0)),
                   'veteran': kv(_heat[_heat.GrupoEdad == 'Veteran'].groupby('cp')['value_eur'].mean().reindex(VAP_ORDER).fillna(0))},
}

# anomalías (Fase III): z-score en age y wage_eur (umbral 3.0); IQR en BrechaPotencial
def zscore_anom(col, label, n=5):
    s = df[col]; z = (s - s.mean()) / s.std()
    sub = df.loc[z.abs() > 3].copy(); sub['z'] = z[z.abs() > 3]
    sub = sub.reindex(sub['z'].abs().sort_values(ascending=False).index).head(n)
    return [{'n': r['short_name'], 'val': float(round(r[col], 1)), 'z': float(round(r['z'], 2))} for _, r in sub.iterrows()]
# anomalías y rankings globales = sobre TODO el dataset (Fase III); dedup por jugador (su pico) para no repetir nombres
br = df['brecha']; q1b, q3b = br.quantile([.25, .75]); iqrb = q3b - q1b
iqr_hi = q3b + 1.5 * iqrb
best_brecha = df.groupby('short_name')['brecha'].max().sort_values(ascending=False)
salary_low = df[df.overall < 70].sort_values('wage_eur', ascending=False).drop_duplicates('short_name')
data['e3']['anom'] = {
 'zAge': zscore_anom('age', 'Edad'),
 'zWage': zscore_anom('wage_eur', 'Salario'),
 'iqrThreshold': float(round(iqr_hi, 1)),
 'iqrBrecha': [{'n': k, 'val': int(v)} for k, v in best_brecha.head(5).items()],
 'topBrecha': [{'k': k, 'v': int(v)} for k, v in best_brecha.head(5).items()],
 'salaryHighRatingLow': [{'n': r['short_name'], 'o': int(r['overall']), 'w': int(r['wage_eur'])}
                         for _, r in salary_low.head(5).iterrows()],
}

# global / específico — TODO el dataset; jugadores deduplicados por su valor/potencial pico (Fase III)
data['e3']['global'] = {
 'topValue': kv(df.groupby('short_name')['value_eur'].max().sort_values(ascending=False).head(10)),
 'topPot': kv(df.groupby('short_name')['potential'].max().sort_values(ascending=False).head(10)),
 'topCountries': kv(top(df.groupby('nationality')['value_eur'].sum())),
 'ratioClubs': kv(top(df[df.wage_eur > 0].assign(r=df.value_eur / df.wage_eur).groupby('club_name')['r'].mean(), 8)),
 'potByAge': kv(df.groupby('GrupoEdad')['potential'].mean().reindex(AGE_ORDER)),
 'topYoungRating': [{'k': k, 'v': int(v)} for k, v in
                    df[(df.age < 21) & (df.overall > 80)].groupby('short_name')['overall'].max().sort_values(ascending=False).head(10).items()],
 'topClubsRating': kv(top(df.groupby('club_name')['overall'].mean())),
}

# ETAPA 4 — Predictivo + Prescriptivo
data['e4'] = {
 # predictivo (valores reportados en el notebook Fase IV)
 'valueModel': {'feats': [['overall', 0.897], ['potential', 0.814], ['log_wage', 0.705], ['passing', 0.581], ['dribbling', 0.519]],
                'r2': 0.89, 'rmse': 0.45, 'predictors': 'overall + age'},
 'potModelLR': {'accuracy': 0.96, 'precision': 0.17, 'recall': 0.87, 'f1': 0.29,
                'confusion': [[60954, 2808], [87, 593]]},
 'potModelRF': {'accuracy': 0.99, 'precision': 0.88, 'recall': 0.51, 'f1': 0.65,
                'confusion': [[63715, 47], [333, 347]]},
 'clusters': [
   {'label': 'Jóvenes de bajo potencial', 'c': 0},
   {'label': 'Estrellas establecidas', 'c': 1},
   {'label': 'Veteranos consolidados', 'c': 2},
   {'label': 'Talento joven con proyección', 'c': 3}],
 'featCorr': kv(df[['overall', 'potential', 'wage_eur', 'passing', 'dribbling', 'age', 'pace', 'shooting']].corrwith(df['value_eur']).sort_values(ascending=False)),
 'regCorr': {},
 'regResiduals': [],
 'clusterPCA': {},
 # contratación: eficiencia = overall / (value_eur/1e6), overall>=75, top3 por posición (Fase IV)
 'contratacion': {}
}
# Regresión lineal: matriz de correlación y residuos (replica Fase IV)
_reg_vars = ['value_eur', 'wage_eur', 'age', 'overall', 'potential', 'passing', 'dribbling']
_reg_cm = df[_reg_vars].corr().round(2)
data['e4']['regCorr'] = {'labels': _reg_vars, 'matrix': _reg_cm.values.tolist()}

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression as _LR
_df_log = df[df.value_eur > 0].copy()
_df_log['log_value_eur'] = np.log1p(_df_log['value_eur'])
_Xr = _df_log[['overall', 'age']]; _yr = _df_log['log_value_eur']
_Xtr, _Xte, _ytr, _yte = train_test_split(_Xr, _yr, test_size=0.2, random_state=1234)
_lr = _LR().fit(_Xtr, _ytr)
_yp = _lr.predict(_Xte)
_res = _yte.values - _yp
_idx = np.random.RandomState(42).choice(len(_yp), size=min(400, len(_yp)), replace=False)
data['e4']['regResiduals'] = [{'x': round(float(_yp[i]), 2), 'y': round(float(_res[i]), 2)} for i in _idx]

# KMeans + PCA (replica Fase IV: age, potential, log_value_eur, log_wage_eur, k=4)
_cl_feats = ['age', 'potential', 'log_value_eur', 'log_wage_eur']
_cl_df = df.assign(log_value_eur=np.log1p(df.value_eur), log_wage_eur=np.log1p(df.wage_eur))[_cl_feats].dropna()
_cl_sc = StandardScaler().fit_transform(_cl_df)
_km = KMeans(n_clusters=4, random_state=42, n_init=10).fit(_cl_sc)
_pca = PCA(n_components=2).fit(_cl_sc)
_coords = _pca.transform(_cl_sc)
_centroids_pca = _pca.transform(_km.cluster_centers_)
_labels_map = {0: 'Jóvenes de bajo potencial', 1: 'Estrellas establecidas',
               2: 'Veteranos consolidados', 3: 'Talento joven con proyección'}
_sample_pts = []
for c in range(4):
    idx = np.where(_km.labels_ == c)[0]
    chosen = np.random.RandomState(42).choice(idx, size=min(200, len(idx)), replace=False)
    for i in chosen:
        _sample_pts.append({'x': round(float(_coords[i, 0]), 2), 'y': round(float(_coords[i, 1]), 2), 'c': int(c)})
data['e4']['clusterPCA'] = {
    'points': _sample_pts,
    'centroids': [{'x': round(float(_centroids_pca[i, 0]), 2), 'y': round(float(_centroids_pca[i, 1]), 2)} for i in range(4)],
    'labels': [_labels_map[i] for i in range(4)],
}

CONT = {'Defensa': ['CB', 'LB', 'RB', 'LWB', 'RWB'], 'Mediocampista': ['CM', 'CAM', 'CDM', 'LM', 'RM'], 'Delantero': ['ST', 'CF', 'LW', 'RW']}
cont = df_best[df_best['overall'] >= 75].copy()
cont['ef'] = cont['overall'] / (cont['value_eur'] / 1e6)
for nombre, pl in CONT.items():
    t3 = cont[cont['PosicionPrincipal'].isin(pl)].nlargest(3, 'ef')
    data['e4']['contratacion'][nombre] = [[r['short_name'], int(r['overall']), int(r['value_eur']), round(float(r['ef']), 1)] for _, r in t3.iterrows()]

# Prescriptivo: comparación Greedy vs linprog (valores del notebook Fase IV)
data['e4']['greedyVsLp'] = {
    'rating': {'greedy': 881, 'linprog': 950},
    'cost': {'greedy': 150.0, 'linprog': 143.8},
}
# Eficiencia contratación como gráfico (top 3 por posición, barras)
_ef_chart = []
for nombre in ['Defensa', 'Mediocampista', 'Delantero']:
    for r in data['e4']['contratacion'][nombre]:
        _ef_chart.append({'k': f'{r[0]} ({nombre[:3]})', 'v': r[3]})
data['e4']['efChart'] = _ef_chart
# Top 10 clubes por overall (cubo prescriptivo)
data['e4']['topClubsOvr'] = kv(top(df.groupby('club_name')['overall'].mean()))

# Cubos dimensionales (réplica exacta del notebook Fase IV)
_cubo_liga = df.groupby('league_name')['overall'].mean().sort_values(ascending=False).head(10)
data['e4']['topLigasOvr'] = kv(_cubo_liga)
_cubo_edad = df.groupby('GrupoEdad').agg(Overall_Promedio=('overall','mean'), Potencial_Promedio=('potential','mean'),
    Valor_Promedio_EUR=('value_eur','mean')).round(2)
_age_order = [g for g in ['Young','Prime','Veteran'] if g in _cubo_edad.index]
if _age_order: _cubo_edad = _cubo_edad.reindex(_age_order)
data['e4']['cuboEdad'] = [{'k': g, 'ovr': round(float(r['Overall_Promedio']),2), 'pot': round(float(r['Potencial_Promedio']),2),
    'val': round(float(r['Valor_Promedio_EUR']),0)} for g, r in _cubo_edad.iterrows()]

# Regresión de valor (log1p(value) ~ overall + age + potential), en la línea de Fase IV.
# El dashboard "Vender o No" la usa para ESTIMAR el valor del jugador y calcular su valor/rating.
_rg = df[df.value_eur > 0]
_X = np.column_stack([np.ones(len(_rg)), _rg['overall'], _rg['age'], _rg['potential']])
_coef, *_ = np.linalg.lstsq(_X, np.log1p(_rg['value_eur'].values), rcond=None)
data['e4']['valueReg'] = {'b0': float(_coef[0]), 'ovr': float(_coef[1]), 'age': float(_coef[2]), 'pot': float(_coef[3])}

# POOL (dashboards)
GK_CAT = {'Portero': 'GK', 'Defensa': 'DEF', 'Mediocampista': 'MID', 'Delantero': 'ATT'}
pool = df_best[df_best['GrupoPosicion'].isin(GK_CAT)].copy()
pool['cat'] = pool['GrupoPosicion'].map(GK_CAT)
data['pool'] = [{'n': r.short_name, 'a': int(r.age), 'c': r.club_name, 'p': r.GrupoPosicion, 'cat': r.cat,
                 'o': int(r.overall), 't': int(r.potential), 'v': int(r.value_eur), 'w': int(r.wage_eur),
                 'b': int(r.brecha)} for r in pool.itertuples(index=False)]
# umbral de referencia (informativo): media valor/rating del cohorte joven+alto potencial (Fase IV)
cohort = df_best[(df_best['age'] < 25) & (df_best['potential'] > 85)]
data['vprMean'] = float(round((cohort['value_eur'] / cohort['overall']).mean(), 2)) if len(cohort) else 0.0

out = os.path.join(HERE, 'data.js')
with open(out, 'w', encoding='utf-8') as f:
    f.write('// Datos precalculados desde el dataset final FIFA (2015–2024). Generado por export_web_data.py\n')
    f.write('const DATA = ' + json.dumps(data, ensure_ascii=False) + ';\n')
print('OK data.js |', round(os.path.getsize(out) / 1024), 'KB | pool:', len(data['pool']), '| temporada', S)
